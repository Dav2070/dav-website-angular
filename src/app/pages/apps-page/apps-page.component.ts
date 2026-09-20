import { Component, inject } from "@angular/core"
import { AppCardsComponent } from "../../components/app-cards/app-cards.component"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-apps-page",
	imports: [AppCardsComponent],
	templateUrl: "./apps-page.component.html"
})
export class AppsPageComponent {
	readonly store = inject(PageStore)
}
