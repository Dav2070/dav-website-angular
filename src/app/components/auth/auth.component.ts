import {
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	inject,
	input,
	signal
} from "@angular/core"
import { ActivatedRoute, RouterLink } from "@angular/router"
import { errorText, fieldValue, PageStore } from "../../page-data"

@Component({
	selector: "app-auth",
	imports: [RouterLink],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./auth.component.html",
	styleUrl: "./auth.component.scss"
})
export class AuthComponent {
	readonly store = inject(PageStore)
	readonly route = inject(ActivatedRoute)
	readonly mode = input<"login" | "signup" | "forgot" | "reset">("login")
	readonly busy = signal(false)
	readonly error = signal("")
	readonly value = fieldValue
	firstName = ""
	email = ""
	password = ""
	confirmation = ""
	get locale(): any {
		const l = this.store.locale()
		return this.mode() === "login"
			? l.loginPage
			: this.mode() === "signup"
				? l.signupPage
				: this.mode() === "forgot"
					? l.forgotPasswordPage
					: l.passwordResetPage
	}
	get actionLabel() {
		return this.mode() === "login"
			? this.locale.login
			: this.mode() === "signup"
				? this.locale.signup
				: this.mode() === "forgot"
					? this.locale.send
					: this.locale.save
	}

	async submit(existing = false) {
		if (this.busy()) return
		const l = this.store.locale()
		if (!existing) {
			if (this.mode() === "signup" && !this.firstName.trim())
				return this.error.set(l.signupPage.errors.firstNameMissing)
			if (
				this.mode() !== "reset" &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
			)
				return this.error.set(l.signupPage.errors.emailInvalid)
			if (this.mode() !== "forgot" && !this.password)
				return this.error.set(l.signupPage.errors.passwordMissing)
			if (
				(this.mode() === "signup" || this.mode() === "reset") &&
				this.password !== this.confirmation
			)
				return this.error.set(
					l.signupPage.errors.passwordConfirmationNotMatching
				)
		}
		this.busy.set(true)
		this.error.set("")
		const query = this.route.snapshot.queryParamMap
		const endpoint = existing
			? "create_session_from_access_token"
			: this.mode() === "forgot"
				? "send_password_reset_email"
				: this.mode() === "reset"
					? "set_password"
					: this.mode()
		try {
			const result = await this.store.request("POST", "/api/" + endpoint, {
				firstName: this.firstName.trim(),
				email: this.email.trim(),
				password: this.password,
				appId: Number(query.get("appId")) || 4,
				apiKey: query.get("apiKey") || undefined,
				id: Number(query.get("userId")),
				passwordConfirmationToken: query.get("passwordConfirmationToken"),
				deviceName: null,
				deviceOs: navigator.userAgent
			})
			if (this.mode() === "forgot") {
				location.assign("/?message=passwordReset")
				return
			}
			if (this.mode() === "reset") {
				location.assign("/?message=changePassword")
				return
			}
			const callback = query.get("redirectUrl")
			if (callback) {
				const url = new URL(callback)
				if (
					![
						"https:",
						"http:",
						"pocketlib:",
						"calendo:",
						"universalsoundboard:"
					].includes(url.protocol)
				)
					throw new Error("Invalid redirect URL")
				url.searchParams.set("accessToken", result.accessToken)
				location.assign(url.href)
			} else {
				const url = new URL(query.get("redirect") || "/", location.origin)
				location.assign(
					url.origin === location.origin
						? url.pathname + url.search + location.hash
						: "/"
				)
			}
		} catch (error) {
			this.error.set(errorText(error, l))
		} finally {
			this.busy.set(false)
		}
	}
}
