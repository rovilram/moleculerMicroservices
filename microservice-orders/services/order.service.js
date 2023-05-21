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
				sid: { type: "string" },
				$$strict: true,
			},
			async handler(ctx) {
				const order = await orderHelper.add({
					...ctx.params,
					id: ctx.meta.id,
				});
				this.broker.emit("order.new", order);
				return { ok: 1, order };
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
				const { orderId, sid } = ctx.params.data;
				if (ok) this.setOrderStatus(orderId, "confirmed", sid);
				else this.setOrderStatus(orderId, "rejected", sid);
			},
		},
	},

	/**
	 * Methods
	 */
	methods: {
		setOrderStatus(id, status, sid) {
			const resp = orderHelper.setStatus(id, status);
			if (resp) {
				this.broker.emit("order.status", { id, status, sid });
				console.log("he emitido", id, status, sid);
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
