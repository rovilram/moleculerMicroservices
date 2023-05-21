"use strict";

const orderHelper = require("../helpers/order");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "order",

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
	actions: {
		/**
		 * Add an order
		 * @params user
		 * @params quantity
		 * @params type
		 * @params productName
		 *
		 * @returns order
		 */
		add: {
			rest: {
				method: "POST",
				path: "/",
			},
			params: {
				user: { type: "email" },
				quantity: {
					type: "number",
					interger: "true",
					positive: "true",
				},
				type: { type: "string", enum: ["in", "out"] },
				productName: { type: "string" },
				$$strict: true,
			},
			async handler(ctx) {
				const order = await orderHelper.add(ctx.params);
				this.broker.emit("order.new", order);
			},
		},
		list: {
			rest: {
				method: "GET",
				path: "/",
			},
			async handler() {
				return orderHelper.list();
			},
		},
		listOrder: {
			rest: {
				method: "GET",
				path: "/:id",
			},
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				return orderHelper.list(ctx.params.id);
			},
		},
	},

	/**
	 * Events
	 */
	events: {
		"stock.updated": {
			async handler(ctx) {
				const { ok } = ctx.params;
				const { orderId } = ctx.params.data;
				if (ok) this.setOrderStatus(orderId, "confirmed");
				else this.setOrderStatus(orderId, "rejected");
			},
		},
	},

	/**
	 * Methods
	 */
	methods: {
		setOrderStatus(id, status) {
			const resp = orderHelper.setStatus(id, status);
			if (resp) {
				this.broker.emit("order.status", { id, status });
				console.log("he emitido", id, status);
			}
		},
	},

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
