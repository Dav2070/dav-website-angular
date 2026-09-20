import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-start-page",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./start-page.component.html",
	styleUrl: "./start-page.component.scss"
})
export class StartPageComponent {
	readonly store = inject(PageStore)
	readonly apps = [
		{
			name: "Storyline",
			image: "StorylineScreenshot.png",
			description: "storylineDescription",
			web: "https://storyline.press/",
			microsoft: "",
			google: "",
			width: 400,
			height: 790
		},
		{
			name: "PocketLib",
			image: "PocketLibScreenshot.png",
			description: "pocketlibDescription",
			web: "https://pocketlib.app",
			microsoft: "9PGMTP14CLJW",
			google: "app.dav.pocketlib",
			width: 400,
			height: 790
		},
		{
			name: "UniversalSoundboard",
			image: "UniversalSoundboardScreenshot.jpg",
			description: "universalSoundboardDescription",
			web: "",
			microsoft: "9NBLGGH51005",
			google: "",
			width: 800,
			height: 570
		},
		{
			name: "Calendo",
			image: "CalendoScreenshot.png",
			description: "calendoDescription",
			web: "https://calendo.dav-apps.tech",
			microsoft: "9MVL99JVT1SS",
			google: "app.dav.calendo",
			width: 400,
			height: 790
		}
	]
	description(key: string) {
		return this.store.locale().startPage[key]
	}
}
