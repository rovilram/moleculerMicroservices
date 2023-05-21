"use strict";
const warehouseHelper = require("../helpers/warehouse");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "warehouse",

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {},

	/**
	 * Events
	 */
	events: {
		"order.new": {
			async handler(ctx) {
				console.log("order", ctx.params.order);
				const resp = await warehouseHelper.updateStock(
					ctx.params.order
				);
				console.log("resp", resp);
				this.broker.emit("stock.updated", { ...resp });
			},
		},
	},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
