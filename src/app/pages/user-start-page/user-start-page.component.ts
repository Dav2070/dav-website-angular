import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core"
import { AppCardsComponent } from "../../components/app-cards/app-cards.component"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-user-start-page",
	imports: [AppCardsComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./user-start-page.component.html"
})
export class UserStartPageComponent {
	readonly store = inject(PageStore)
}
