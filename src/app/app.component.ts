import "dav-ui-components"
import {
	afterNextRender,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	DestroyRef,
	inject,
	signal
} from "@angular/core"
import { Router, RouterLink, RouterOutlet } from "@angular/router"
import { setTheme, setLocale, Theme } from "dav-ui-components"
import { PageStore } from "./page-data"

@Component({
	selector: "app-root",
	imports: [RouterLink, RouterOutlet],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent {
	readonly store = inject(PageStore)
	readonly router = inject(Router)
	readonly navigationBackgroundVisible = signal(false)
	readonly theme = signal("system")
	readonly year = new Date().getFullYear()
	readonly showFooter = computed(() =>
		[
			"start-page",
			"pricing-page",
			"apps-page",
			"contact-page",
			"privacy-page"
		].includes(
			this.store.page()?.name ?? ""
		)
	)

	constructor() {
		const destroy = inject(DestroyRef)
		afterNextRender(() => {
			const updateNavigation = () =>
				this.navigationBackgroundVisible.set(window.scrollY > 80)
			updateNavigation()
			window.addEventListener("scroll", updateNavigation, { passive: true })
			const handleLinkButtonClick = (event: MouseEvent) => {
				if (
					event.defaultPrevented ||
					event.button !== 0 ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey ||
					event.altKey
				)
					return

				const linkButton = event
					.composedPath()
					.find(
						(node): node is HTMLElement =>
							node instanceof HTMLElement &&
							node.localName === "dav-link-button"
					)
				if (!linkButton || linkButton.hasAttribute("data-force-reload")) return

				const url =
					(linkButton as HTMLElement & { url?: string }).url ||
					linkButton.getAttribute("url") ||
					""
				const target =
					linkButton.getAttribute("target") ||
					(linkButton as HTMLElement & { target?: string }).target
				if (target !== "_self" || !url.startsWith("/") || url.startsWith("//"))
					return

				event.preventDefault()
				void this.router.navigateByUrl(url)
			}
			document.addEventListener("click", handleLinkButtonClick)

			const saved = document.cookie.match(
				/(?:^|; )dav-theme=(light|dark|system)(?:;|$)/
			)?.[1]
			this.theme.set(saved || "system")
			this.applyTheme()
			setLocale(this.store.locale().lang)
			const media = matchMedia("(prefers-color-scheme: dark)")
			const listener = () => this.applyTheme()
			media.addEventListener("change", listener)
			destroy.onDestroy(() => {
				window.removeEventListener("scroll", updateNavigation)
				document.removeEventListener("click", handleLinkButtonClick)
				media.removeEventListener("change", listener)
			})
		})
	}

	logout() {
		window.location.assign("/logout")
	}

	private applyTheme() {
		document.documentElement.dataset["theme"] = this.theme()
		const dark =
			this.theme() === "dark" ||
			(this.theme() === "system" &&
				matchMedia("(prefers-color-scheme: dark)").matches)
		setTheme(dark ? Theme.dark : Theme.light)
	}
}
