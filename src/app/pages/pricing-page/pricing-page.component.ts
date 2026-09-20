import { Component, inject } from "@angular/core"
import { PricingComponent } from "../../components/pricing/pricing.component"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-pricing-page",
	imports: [PricingComponent],
	templateUrl: "./pricing-page.component.html"
})
export class PricingPageComponent {
	readonly store = inject(PageStore)
}
