import {
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	inject
} from "@angular/core"
import { Meta, Title } from "@angular/platform-browser"
import { PageStore } from "../../page-data"
import { AppPageComponent } from "../app-page/app-page.component"
import { AppStatisticsPageComponent } from "../app-statistics-page/app-statistics-page.component"
import { AppsPageComponent } from "../apps-page/apps-page.component"
import { ContactPageComponent } from "../contact-page/contact-page.component"
import { DevPageComponent } from "../dev-page/dev-page.component"
import { ForgotPasswordPageComponent } from "../forgot-password-page/forgot-password-page.component"
import { LoginPageComponent } from "../login-page/login-page.component"
import { NotFoundPageComponent } from "../not-found-page/not-found-page.component"
import { PasswordResetPageComponent } from "../password-reset-page/password-reset-page.component"
import { PocketlibTermsPageComponent } from "../pocketlib-terms-page/pocketlib-terms-page.component"
import { PricingPageComponent } from "../pricing-page/pricing-page.component"
import { PrivacyPageComponent } from "../privacy-page/privacy-page.component"
import { SignupPageComponent } from "../signup-page/signup-page.component"
import { StartPageComponent } from "../start-page/start-page.component"
import { StatisticsPageComponent } from "../statistics-page/statistics-page.component"
import { UnavailablePageComponent } from "../unavailable-page/unavailable-page.component"
import { UserPageComponent } from "../user-page/user-page.component"
import { UserStartPageComponent } from "../user-start-page/user-start-page.component"

@Component({
	selector: "app-page",
	imports: [
		AppPageComponent,
		AppStatisticsPageComponent,
		AppsPageComponent,
		ContactPageComponent,
		DevPageComponent,
		ForgotPasswordPageComponent,
		LoginPageComponent,
		NotFoundPageComponent,
		PasswordResetPageComponent,
		PocketlibTermsPageComponent,
		PricingPageComponent,
		PrivacyPageComponent,
		SignupPageComponent,
		StartPageComponent,
		StatisticsPageComponent,
		UnavailablePageComponent,
		UserPageComponent,
		UserStartPageComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./page.component.html",
	styleUrl: "./page.component.scss"
})
export class PageComponent {
	readonly store = inject(PageStore)

	constructor() {
		const title = inject(Title)
		const meta = inject(Meta)
		effect(() => {
			const page = this.store.page()
			title.setTitle(
				page?.data.locale?.title ? `${page.data.locale.title} – dav` : "dav"
			)
			meta.updateTag({
				name: "description",
				content: this.store.locale().startPage.title
			})
			meta.updateTag({
				name: "robots",
				content: [
					"start-page",
					"pricing-page",
					"apps-page",
					"contact-page",
					"privacy-page",
					"pocketlib-terms-page"
				].includes(page?.name)
					? "index, follow"
					: "noindex, nofollow"
			})
		})
	}
}
