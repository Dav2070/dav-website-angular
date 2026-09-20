import {
	inject,
	Injectable,
	makeStateKey,
	REQUEST_CONTEXT,
	signal,
	TransferState
} from "@angular/core"
import { DOCUMENT } from "@angular/common"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { ResolveFn, Router } from "@angular/router"
import { firstValueFrom } from "rxjs"
import { getLocale } from "../locales"

export interface PageData {
	name: string
	path: string
	data: Record<string, any>
}
const PAGE_STATE = makeStateKey<PageData>("dav-page")

@Injectable({ providedIn: "root" })
export class PageStore {
	private readonly http = inject(HttpClient)
	private readonly transfer = inject(TransferState)
	private readonly initial = (
		inject(REQUEST_CONTEXT, { optional: true }) as { page?: PageData }
	)?.page
	private readonly document = inject(DOCUMENT)
	readonly page = signal<PageData>(null)
	readonly locale = signal(getLocale("en"))
	readonly user = signal<any>(null)

	async load(path: string): Promise<PageData | { redirect: string }> {
		let page: PageData
		if (this.initial) {
			page = this.initial
			this.transfer.set(PAGE_STATE, page)
		} else if (this.transfer.hasKey(PAGE_STATE)) {
			page = this.transfer.get(PAGE_STATE, null)
			this.transfer.remove(PAGE_STATE)
		} else {
			try {
				const response = await firstValueFrom(
					this.http.get<PageData | { redirect: string }>("/api/page", {
						params: { path },
						transferCache: false
					})
				)
				if ("redirect" in response) return response
				page = response
			} catch (error) {
				page =
					error instanceof HttpErrorResponse &&
					typeof error.error?.name === "string" &&
					error.error?.data
						? error.error
						: {
								name: "unavailable",
								path,
								data: { lang: this.locale().lang }
							}
			}
		}
		this.page.set(page)
		this.locale.set(getLocale(page.data.lang || "en"))
		this.document.documentElement.lang = this.locale().lang
		this.user.set(page.data.user)
		return page
	}

	async request<T = any>(
		method: string,
		path: string,
		body?: unknown
	): Promise<T> {
		return firstValueFrom(
			this.http.request<T>(method, path, {
				body,
				headers: { "X-CSRF-TOKEN": this.page()?.data.csrfToken || "" },
				transferCache: false
			})
		)
	}
}

export const pageResolver: ResolveFn<PageData> = async (_route, state) => {
	const store = inject(PageStore)
	const router = inject(Router)
	const result = await store.load(state.url)
	if ("redirect" in result) {
		const { RedirectCommand } = await import("@angular/router")
		return new RedirectCommand(router.parseUrl(result.redirect))
	}
	return result
}

export function fieldValue(event: Event): string {
	return (event as CustomEvent<{ value: string }>).detail.value
}

export function errorText(error: any, locale: any): string {
	if (error.status === 401 || error.status === 403)
		return locale.misc.expiredSessionDialog.description
	const codes = error.error?.errors
	if (
		codes?.includes("PASSWORD_INCORRECT") ||
		codes?.includes("USER_DOES_NOT_EXIST")
	)
		return locale.loginPage.errors.loginFailed
	const messages: Record<string, string> = {
		FIRST_NAME_TOO_SHORT: locale.signupPage.errors.firstNameTooShort,
		FIRST_NAME_TOO_LONG: locale.signupPage.errors.firstNameTooLong,
		PASSWORD_TOO_SHORT: locale.signupPage.errors.passwordTooShort,
		PASSWORD_TOO_LONG: locale.signupPage.errors.passwordTooLong,
		EMAIL_INVALID: locale.signupPage.errors.emailInvalid,
		EMAIL_ALREADY_IN_USE: locale.signupPage.errors.emailTaken
	}
	return (
		codes
			?.map((code: string) => messages[code])
			.filter(Boolean)
			.join(" ") || locale.misc.messages.errorMessage
	)
}
