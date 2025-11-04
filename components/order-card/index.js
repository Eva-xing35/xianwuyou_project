Component({
  properties: {
    order: {
      type: Object,
      value: {}
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("tap", { orderId: this.properties.order.id });
    },
    handlePrimaryAction() {
      this.triggerEvent("primary", { orderId: this.properties.order.id });
    },
    handleSecondaryAction() {
      this.triggerEvent("secondary", { orderId: this.properties.order.id });
    }
  }
});
