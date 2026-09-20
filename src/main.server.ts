import "@dav-apps/ssr-angular/enable-lit-ssr.js"
import {
	bootstrapApplication,
	BootstrapContext
} from "@angular/platform-browser"
import { mergeApplicationConfig } from "@angular/core"
import { provideServerRendering, RenderMode, withRoutes } from "@angular/ssr"
import { provideLitSsr } from "@dav-apps/ssr-angular"
import { AppComponent } from "./app/app.component"
import { appConfig } from "./app/app.config"

export default (context: BootstrapContext) =>
	bootstrapApplication(
		AppComponent,
		mergeApplicationConfig(appConfig, {
			providers: [
				provideServerRendering(
					withRoutes([{ path: "**", renderMode: RenderMode.Server }])
				),
				provideLitSsr()
			]
		}),
		context
	)
