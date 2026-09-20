import {
	afterNextRender,
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	DestroyRef,
	ElementRef,
	inject,
	input,
	signal,
	viewChild
} from "@angular/core"
import { errorText, fieldValue, PageStore } from "../../page-data"
import type { Chart } from "chart.js"

@Component({
	selector: "app-developer",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./developer.component.html",
	styleUrl: "./developer.component.scss"
})
export class DeveloperComponent {
	readonly store = inject(PageStore)
	readonly mode = input("dashboard")
	readonly app = signal<any>(null)
	readonly busy = signal(false)
	readonly error = signal("")
	readonly editing = signal(false)
	readonly publishing = signal(false)
	readonly snapshots = signal<any[]>([])
	readonly months = signal(1)
	readonly value = fieldValue
	readonly usersCanvas =
		viewChild<ElementRef<HTMLCanvasElement>>("usersCanvas")
	readonly activeCanvas =
		viewChild<ElementRef<HTMLCanvasElement>>("activeCanvas")
	readonly plansCanvas =
		viewChild<ElementRef<HTMLCanvasElement>>("plansCanvas")
	readonly confirmationsCanvas = viewChild<ElementRef<HTMLCanvasElement>>(
		"confirmationsCanvas"
	)
	private charts: Chart[] = []
	private destroyed = false
	edit: Record<string, string> = {}
	readonly fields = [
		"name",
		"description",
		"webLink",
		"googlePlayLink",
		"microsoftStoreLink"
	]
	get locale() {
		return this.store.locale()
	}
	get appId() {
		return this.store.page().path.split("?")[0].split("/")[2]
	}
	get statistics() {
		return this.mode().includes("statistics")
	}

	constructor() {
		const destroy = inject(DestroyRef)
		destroy.onDestroy(() => {
			this.destroyed = true
			this.charts.forEach(chart => chart.destroy())
		})
		afterNextRender(() => {
			this.load()
			const redraw = () => {
				if (this.statistics && !this.busy()) void this.drawCharts()
			}
			const observer = new MutationObserver(redraw)
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme"]
			})
			const media = matchMedia("(prefers-color-scheme: dark)")
			media.addEventListener("change", redraw)
			destroy.onDestroy(() => {
				observer.disconnect()
				media.removeEventListener("change", redraw)
			})
		})
	}

	async load() {
		this.busy.set(true)
		this.error.set("")
		try {
			if (this.mode() === "app" || this.mode() === "app-statistics")
				this.app.set(
					await this.store.request("GET", `/api/app/${this.appId}`)
				)
			if (this.statistics) {
				const path =
					this.mode() === "app-statistics"
						? `/api/app/${this.appId}/user_snapshots`
						: "/api/user_snapshots"
				const data = await this.store.request<any[]>(
					"GET",
					`${path}?months=${this.months()}`
				)
				this.snapshots.set(
					[...data].sort(
						(a, b) =>
							new Date(a.time).getTime() - new Date(b.time).getTime()
					)
				)
				await this.drawCharts()
			}
		} catch (error) {
			this.error.set(errorText(error, this.locale))
		} finally {
			this.busy.set(false)
		}
	}

	openEdit() {
		for (const field of this.fields)
			this.edit[field] =
				this.app()[field[0].toUpperCase() + field.slice(1)] || ""
		this.editing.set(true)
	}

	requestPublish(event: Event) {
		;(event.target as HTMLElement & { checked: boolean }).checked =
			this.app().Published
		this.publishing.set(true)
	}

	async save(published?: boolean) {
		if (this.busy()) return
		if (
			published === undefined &&
			(!this.edit["name"]?.trim() || !this.edit["description"]?.trim())
		)
			return this.error.set(
				this.locale.appPage.editAppDialog.errors.nameTooShort
			)
		this.busy.set(true)
		this.error.set("")
		try {
			const body = published === undefined ? this.edit : { published }
			await this.store.request("PUT", `/api/app/${this.appId}`, body)
			this.editing.set(false)
			this.publishing.set(false)
			await this.load()
		} catch (error) {
			this.error.set(errorText(error, this.locale))
		} finally {
			this.busy.set(false)
		}
	}

	async drawCharts() {
		const { Chart } = await import("chart.js/auto")
		if (this.destroyed) return
		this.charts.forEach(chart => chart.destroy())
		this.charts = []
		const data = this.snapshots()
		const labels = data.map(item =>
			new Date(item.time).toLocaleDateString(this.locale.lang)
		)
		const colors = ["#5284df", "#2dba85", "#d99a33", "#bd7beb"]
		const text = getComputedStyle(document.body).color
		const options = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { labels: { color: text } } },
			scales: {
				x: { ticks: { color: text }, grid: { color: "#88888822" } },
				y: {
					beginAtZero: true,
					ticks: { color: text },
					grid: { color: "#88888822" }
				}
			}
		}
		const draw = (
			element: ElementRef<HTMLCanvasElement>,
			entries: { label: string; values: number[] }[]
		) => {
			this.charts.push(
				new Chart(element.nativeElement, {
					type: "line",
					data: {
						labels,
						datasets: entries.map((entry, i) => ({
							label: entry.label,
							data: entry.values,
							borderColor: colors[i],
							backgroundColor: colors[i],
							pointRadius: 0,
							tension: 0.2
						}))
					},
					options
				})
			)
		}
		draw(this.usersCanvas(), [
			{
				label: this.locale.statisticsPage.numberOfUsers,
				values: data.map(s => s.freePlan + s.plusPlan + s.proPlan)
			},
			...["freePlan", "plusPlan", "proPlan"].map((key, i) => ({
				label: ["Free", "Plus", "Pro"][i],
				values: data.map(s => s[key])
			}))
		])
		draw(
			this.activeCanvas(),
			["daily", "weekly", "monthly", "yearly"].map(key => ({
				label: this.locale.statisticsPage[key],
				values: data.map(s => s[key + "Active"])
			}))
		)
		const last = data.at(-1)
		const pie = (
			element: ElementRef<HTMLCanvasElement>,
			names: string[],
			values: number[]
		) =>
			this.charts.push(
				new Chart(element.nativeElement, {
					type: "doughnut",
					data: {
						labels: names,
						datasets: [{ data: values, backgroundColor: colors }]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: { legend: { labels: { color: text } } }
					}
				})
			)
		pie(
			this.plansCanvas(),
			["Free", "Plus", "Pro"],
			last ? [last.freePlan, last.plusPlan, last.proPlan] : []
		)
		pie(
			this.confirmationsCanvas(),
			[
				this.locale.statisticsPage.confirmed,
				this.locale.statisticsPage.unconfirmed
			],
			last ? [last.emailConfirmed, last.emailUnconfirmed] : []
		)
	}
}
