import { By, until } from 'selenium-webdriver';

export default url => driver => ({
    elements: {
        addFilterButton: By.css('.add-filter'),
        appLoader: By.css('.app-loader'),
        displayedRecords: By.css('.displayed-records'),
        filter: name => By.css(`.filter-field[data-source='${name}'] input`),
        filterMenuItems: By.css(`.new-filter-item`),
        menuItems: By.css(`[role=menuitem`),
        filterMenuItem: source =>
            By.css(`.new-filter-item[data-key="${source}"]`),
        hideFilterButton: source =>
            By.css(`.filter-field[data-source="${source}"] .hide-filter`),
        nextPage: By.css('.next-page'),
        pageNumber: n => By.css(`.page-number[data-page='${n}']`),
        previousPage: By.css('.previous-page'),
        recordRows: By.css('.datagrid-body tr'),
        datagridHeaders: By.css('th'),
        title: By.css('.title'),
        logout: By.css('.logout'),
    },

    navigate() {
        driver.navigate().to(url);
        return this.waitUntilDataLoaded();
    },

    waitUntilVisible() {
        return driver.wait(until.elementLocated(this.elements.title));
    },

    waitUntilDataLoaded() {
        let continued = true;
        return driver
            .wait(until.elementLocated(this.elements.appLoader), 2000)
            .catch(() => (continued = false)) // no loader - we're on the same page !
            .then(
                () =>
                    continued
                        ? driver.wait(
                              until.stalenessOf(
                                  driver.findElement(this.elements.appLoader)
                              )
                          )
                        : true
            )
            .catch(() => {}) // The element might have disapeared before the wait on the previous line
            .then(() => driver.sleep(100)); // let some time to redraw;
    },

    getNbRows() {
        return driver
            .findElements(this.elements.recordRows)
            .then(rows => rows.length);
    },

    getColumns() {
        return driver
            .findElements(this.elements.datagridHeaders)
            .then(ths => Promise.all(ths.map(th => th.getText())));
    },

    getResources() {
        return driver
            .findElements(this.elements.menuItems)
            .then(menuItems =>
                Promise.all(menuItems.map(menuItem => menuItem.getText()))
            );
    },

    getAvailableFilters() {
        const addFilterButton = driver.findElement(
            this.elements.addFilterButton
        );
        addFilterButton.click();
        driver.sleep(500); // wait until the dropdown animation ends
        driver.wait(until.elementLocated(this.elements.filterMenuItems));

        return driver
            .findElements(this.elements.filterMenuItems)
            .then(filters =>
                Promise.all(filters.map(filter => filter.getText()))
            );
    },

    getNbPagesText() {
        return driver.findElement(this.elements.displayedRecords).getText();
    },

    nextPage() {
        return driver
            .findElement(this.elements.nextPage)
            .then(element =>
                driver
                    .executeScript(
                        'arguments[0].scrollIntoView(true);',
                        element
                    )
                    .then(() => element)
            )
            .then(element => driver.sleep(250).then(() => element))
            .then(element => element.click())
            .then(() => this.waitUntilDataLoaded());
    },

    previousPage() {
        return driver
            .findElement(this.elements.previousPage)
            .then(element =>
                driver
                    .executeScript(
                        'arguments[0].scrollIntoView(true);',
                        element
                    )
                    .then(() => element)
            )
            .then(element => driver.sleep(250).then(() => element))
            .then(element => element.click())
            .then(() => this.waitUntilDataLoaded());
    },

    goToPage(n) {
        return driver
            .findElement(this.elements.pageNumber(n))
            .then(element =>
                driver
                    .executeScript(
                        'arguments[0].scrollIntoView(true);',
                        element
                    )
                    .then(() => element)
            )
            .then(element => driver.sleep(250).then(() => element))
            .then(element => element.click())
            .then(() => this.waitUntilDataLoaded());
    },

    setFilterValue(name, value, clearPreviousValue = true) {
        const filterField = driver.findElement(this.elements.filter(name));
        if (clearPreviousValue) {
            filterField.clear();
        }
        filterField.sendKeys(value);
        driver.sleep(500);
        return this.waitUntilDataLoaded();
    },

    showFilter(name) {
        const addFilterButton = driver.findElement(
            this.elements.addFilterButton
        );
        addFilterButton.click();
        driver.sleep(500); // wait until the dropdown animation ends
        driver.wait(until.elementLocated(this.elements.filterMenuItem(name)));
        driver.findElement(this.elements.filterMenuItem(name)).click();
        return this.waitUntilDataLoaded();
    },

    hideFilter(name) {
        const hideFilterButton = driver.findElement(
            this.elements.hideFilterButton(name)
        );
        hideFilterButton.click();
        return this.waitUntilDataLoaded(); // wait for debounce and reload
    },

    logout() {
        driver.findElement(this.elements.logout).click();
    },
});
