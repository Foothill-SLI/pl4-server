module.exports.Subscription = class Subscription {
  constructor(options) {
    options = options || {};
    this.value = 0;
    this.subscribers = new Set();
  }

  subscribe(stream) {
    this.subscribers.add(stream);
  }

  unsubscribe(stream) {
    this.subscribers.delete(stream);
  }

  setValue(val) {
    this.value = val;
    this.onChange();
  }

  increment() {
    this.value++;
    this.onChange();
  }

  decrement() {
    if (this.value === 0) {
      throw new Error('Car count is already zero and cannot be decreased further.');
    }
    this.value--;
    this.onChange();
  }

  onEvent(event = {}) {
    const { timestamp, type } = event;

    if (!timestamp || !type) throw new Error('Required parameters not provided.');

    switch (type) {
      case "IN":
        this.increment();
        break;
      case "OUT":
        this.decrement();
        break;
      default:
        throw new Error(`Unknown event type "${type}" provided`);
    }
    
    this.subscribers.forEach((stream) => {
      stream.send({ data: JSON.stringify(event), event: 'sensor_event' });
    });
  }

  onChange() {
    this.subscribers.forEach((stream) => {
      stream.send({ data: this.value, event: 'count_change' });
    });
  }
}
