import {
	afterNextRender,
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	DestroyRef,
	ElementRef,
	inject,
	Injector,
	signal,
	viewChild
} from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { PricingComponent } from "../../components/pricing/pricing.component"
import { errorText, fieldValue, PageStore } from "../../page-data"
import type Cropper from "cropperjs"

@Component({
	selector: "app-user-page",
	imports: [PricingComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./user-page.component.html",
	styleUrl: "./user-page.component.scss"
})
export class UserPageComponent {
	readonly store = inject(PageStore)
	private readonly injector = inject(Injector)
	readonly section = signal("general")
	readonly busy = signal(false)
	readonly error = signal("")
	readonly success = signal("")
	readonly pendingPlan = signal<string>(null)
	readonly cropVisible = signal(false)
	readonly cropContainer =
		viewChild<ElementRef<HTMLDivElement>>("cropContainer")
	readonly value = fieldValue
	readonly user = signal<any>({ ...this.store.page().data.user })
	private cropper: Cropper
	private imageUrl = ""
	firstName = this.user().FirstName || ""
	email = ""
	password = ""
	confirmation = ""
	get locale() {
		return this.store.locale().userPage
	}
	get data() {
		return this.store.page().data
	}

	constructor() {
		const route = inject(ActivatedRoute)
		const destroy = inject(DestroyRef)
		const sub = route.fragment.subscribe(fragment =>
			this.section.set(fragment === "plans" ? "plans" : "general")
		)
		destroy.onDestroy(() => {
			sub.unsubscribe()
			this.clearCrop()
		})
		afterNextRender(() => {
			if (this.data.showUpgradeSuccessMessage)
				this.success.set(this.locale.plans.changePlanSuccessMessage)
		})
	}

	async action(work: () => Promise<void>) {
		if (this.busy()) return
		this.busy.set(true)
		this.error.set("")
		this.success.set("")
		try {
			await work()
		} catch (error) {
			this.error.set(errorText(error, this.store.locale()))
		} finally {
			this.busy.set(false)
		}
	}

	async save(field: "firstName" | "email" | "password") {
		if (field === "firstName" && !this.firstName.trim())
			return this.error.set(this.locale.errors.firstNameTooShort)
		if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email))
			return this.error.set(this.locale.errors.emailInvalid)
		if (
			field === "password" &&
			(!this.password || this.password !== this.confirmation)
		)
			return this.error.set(
				this.locale.errors.passwordConfirmationNotMatching
			)
		await this.action(async () => {
			await this.store.request("PUT", "/api/user", { [field]: this[field] })
			this.success.set(this.locale.messages[field + "UpdateMessage"])
			if (field === "firstName") {
				this.user.update(user => ({ ...user, FirstName: this.firstName }))
				this.store.user.set(this.user())
			}
			if (field === "password") this.password = this.confirmation = ""
		})
	}

	sendConfirmation() {
		return this.action(async () => {
			await this.store.request("POST", "/api/send_confirmation_email")
			this.success.set(this.locale.messages.sendConfirmationEmailMessage)
		})
	}
	portal() {
		return this.action(async () => {
			const result = await this.store.request(
				"POST",
				"/api/customer_portal_session"
			)
			location.assign(result.url)
		})
	}
	cancelSubscription() {
		return this.action(async () => {
			const result = await this.store.request(
				"PUT",
				"/api/subscription/cancel"
			)
			this.user.update(user => ({
				...user,
				SubscriptionStatus: result.cancelAtPeriodEnd ? "ENDING" : "ACTIVE"
			}))
			this.success.set(
				(result.cancelAtPeriodEnd
					? this.locale.plans.cancelSubscriptionSuccessMessage
					: this.locale.plans.continueSubscriptionSuccessMessage
				).replace("{0}", this.data.periodEndDate || "")
			)
		})
	}
	confirmPlan() {
		const plan = this.pendingPlan()
		if (!plan) return
		return this.action(async () => {
			if (this.user().Plan === "FREE" && plan !== "FREE") {
				const result = await this.store.request(
					"POST",
					"/api/checkout_session",
					{
						plan,
						successUrl: `${location.origin}/user?plan=${plan}#plans`,
						cancelUrl: `${location.origin}/user#plans`
					}
				)
				location.assign(result.url)
			} else {
				await this.store.request("PUT", "/api/subscription", { plan })
				location.assign("/user#plans")
			}
			this.pendingPlan.set(null)
		})
	}

	async selectImage(event: Event) {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		input.value = ""
		if (!file) return
		if (
			!["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
			file.size > 2 * 1024 * 1024
		)
			return this.error.set(this.locale.errors.profileImageFileTooLarge)
		await this.action(async () => {
			this.clearCrop()
			const { default: Cropper } = await import("cropperjs")
			this.imageUrl = URL.createObjectURL(file)
			const image = new Image()
			image.src = this.imageUrl
			image.alt = this.locale.general.profileImageAlt
			await image.decode()
			this.cropContainer().nativeElement.append(image)
			this.cropVisible.set(true)
			// Cropper measures its container, so wait until Angular opens the dialog.
			await new Promise<void>(resolve =>
				afterNextRender(() => resolve(), { injector: this.injector })
			)
			this.cropper = new Cropper(image, {
				container: this.cropContainer().nativeElement
			})
			await this.cropper.getCropperImage().$ready()
			const selection = this.cropper.getCropperSelection()
			if (selection) {
				selection.aspectRatio = 1
				selection.initialCoverage = 0.9
			}
		})
	}

	uploadCrop() {
		return this.action(async () => {
			const canvas = await this.cropper
				.getCropperSelection()
				.$toCanvas({ width: 512, height: 512 })
			const blob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob(
					value =>
						value
							? resolve(value)
							: reject(new Error("Image export failed")),
					"image/png"
				)
			)
			await this.store.request("PUT", "/api/user/profile_image", blob)
			this.user.update(user => ({
				...user,
				ProfileImage: canvas.toDataURL()
			}))
			this.cropVisible.set(false)
			this.clearCrop()
			this.success.set(this.locale.messages.profileImageUpdateMessage)
		})
	}
	closeCrop() {
		this.cropVisible.set(false)
		this.clearCrop()
	}
	private clearCrop() {
		this.cropContainer()?.nativeElement.replaceChildren()
		if (this.imageUrl) URL.revokeObjectURL(this.imageUrl)
		this.imageUrl = ""
	}
}
