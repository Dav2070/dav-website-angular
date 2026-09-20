import {
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	inject,
	input,
	output
} from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-pricing",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./pricing.component.html",
	styleUrl: "./pricing.component.scss"
})
export class PricingComponent {
	readonly store = inject(PageStore)
	readonly selectable = input(false)
	readonly currentPlan = input("FREE")
	readonly choose = output<string>()
	readonly plans = [
		{ name: "Free", value: "FREE" },
		{ name: "Plus", value: "PLUS" },
		{ name: "Pro", value: "PRO" }
	]
	get locale() {
		return this.store.locale().misc.pricing
	}
}
