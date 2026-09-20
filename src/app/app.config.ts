import { ApplicationConfig } from "@angular/core"
import { provideHttpClient, withFetch } from "@angular/common/http"
import {
	provideClientHydration,
	withEventReplay,
	withNoHttpTransferCache
} from "@angular/platform-browser"
import { provideRouter, withInMemoryScrolling } from "@angular/router"
import { provideLitHydration } from "@dav-apps/ssr-angular"
import { pageResolver } from "./page-data"

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch()),
		provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
		provideLitHydration(),
		provideRouter(
			[
				{
					path: "**",
					loadComponent: () =>
						import("./pages/page/page.component").then(
							m => m.PageComponent
						),
					resolve: { page: pageResolver },
					runGuardsAndResolvers: "always"
				}
			],
			withInMemoryScrolling({
				scrollPositionRestoration: "enabled",
				anchorScrolling: "enabled"
			})
		)
	]
}
