class TestSettings {
    constructor() {
        this.currentTab = 'general';
        this.settings = { test: 'value' };
    }
    
    test() {
        return `Tab: ${this.currentTab}, Setting: ${this.settings.test}`;
    }
}

const test = new TestSettings();
console.log(test.test());
