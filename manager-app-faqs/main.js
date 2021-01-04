Vue.use(httpVueLoader);
Vue.use(Toasted);

new Vue({
    el: "#manage-store",
    components: {},
    data: function () {
        return {
            filter: null,
            allStores: [],
            fields: [
                { key: "id", label: "Id", sortable: true, sortDirection: "desc" },
                { key: "store_name", label: "Store Name", sortable: true },
                { key: "installed_date", label: "Installed Date", sortable: true },
                { key: "action", label: "Actions" }
            ],
            currentPage: 1,
            perPage: 10,
            totalRows: 0,
            pageOptions: [10, 20, 30],
            showLoading: false,
            showRestore: false
        };
    },
    mounted: function () {
        this.getAllStores();
    },
    methods: {
        getAllStores: function () {
            var seft = this;
            $.ajax({
                url: "services.php",
                data: {
                    action: "getAllStores"
                },
                dataType: "JSON",
                type: "GET"
            }).done(function (response) {
                seft.allStores = response;
            });
        },
        onFiltered(filteredItems) {
            var seft = this;
            // Trigger pagination to update the number of buttons/pages due to filtering
            seft.totalRows = filteredItems.length;
            seft.currentPage = 1;
        },

        updateDataCache: function (shop) {
            var seft = this;
            seft.allStores.forEach(element => {
                if (element.store_name == shop) {
                    element.status = 1;
                }
            });
            $.ajax({
                url: "services.php",
                data: {
                    action: "updateDataCache",
                    shop: shop
                },
                dataType: "JSON",
                type: "GET"
            }).done(function (response) {
                seft.allStores.forEach(element => {
                    if (element.store_name == shop) {
                        element.status = 0;
                    }
                });
                if (response == true) {
                    seft.$toasted.show("success!", {
                        type: "success",
                        duration: 3000
                    });
                } else {
                    seft.$toasted.show("error!", {
                        type: "error",
                        duration: 3000
                    });
                }
            });
        },

        deleteDataCache: function (shop) {
            var seft = this;
            seft.allStores.forEach(element => {
                if (element.store_name == shop) {
                    element.status_cache = 1;
                }
            });
            $.ajax({
                url: "services.php",
                data: {
                    action: "deleteDataCache",
                    shop: shop
                },
                dataType: "JSON",
                type: "GET"
            }).done(function (response) {
                seft.allStores.forEach(element => {
                    if (element.store_name == shop) {
                        element.status_cache = 0;
                    }
                });
                if (response == true) {
                    seft.$toasted.show("success!", {
                        type: "success",
                        duration: 3000
                    });
                } else {
                    seft.$toasted.show("error!", {
                        type: "error",
                        duration: 3000
                    });
                }
            });
        },

        updateEmailTemplate: function (shop) {
            var seft = this;
            seft.allStores.forEach(element => {
                if (element.store_name == shop) {
                    element.statusEmailTemplate = 1;
                }
            });
            $.ajax({
                url: "services.php",
                data: {
                    action: "getSettings",
                    shop: shop
                },
                dataType: "JSON",
                type: "GET"
            }).done(function (response) {
                self.settings = response;
                self.settings.admin_email_subject = "[PFaqs] New question for {product_name}";
                self.settings.admin_email_body = `<table class="header row" style="width: 100%; border-spacing: 0; border-collapse: collapse; margin: 40px 0 20px;">
                                <tbody>
                                    <tr>
                                        <td class="header__cell" style="font-family: -apple-system, BlinkMacSystemFont,Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                            <center>
                                                <table class="container" style="width: 560px; text-align: left; border-spacing: 0; border-collapse: collapse; margin: 0 auto;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                                <table class="row" style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="shop-name__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                                                <h1 class="shop-name__text" style="font-weight: normal; font-size: 30px; color: #333; margin: 0;"><a class="shop_name" href="https://${shop}" target="_blank" rel="noopener">{!! shop_name !!}</a></h1>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </center>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row content" style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                                <tbody>
                                    <tr>
                                        <td class="content__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; padding-bottom: 40px;">
                                            <center>
                                                <table class="container" style="width: 560px; text-align: left; border-spacing: 0; border-collapse: collapse; margin: 0 auto;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                                <div class="quote-heading" style="margin-bottom: 10px;"><span class="quote-heading-customer-name">A new question for {!! product_name !!}</span></div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </center>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row section" style="width: 560px; border-spacing: 0; border-collapse: collapse; border-top-width: 1px; border-top-color: #e5e5e5; border-top-style: solid; text-align: left; margin: 0 auto;">
                                <tbody>
                                    <tr>
                                        <td class="section__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; padding: 40px 0;">
                                            <center>
                                                <table class="container" style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                                <h3 class="quote-summary">Please find the following details</h3>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table class="container" style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td>{!! question_information !!}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </center>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>`;
                self.settings.customer_email_body = `<table class="header row" style="width: 100%; border-spacing: 0; border-collapse: collapse; margin: 40px 0 20px;">
                            <tbody>
                                <tr>
                                    <td class="header__cell" style="font-family: -apple-system, BlinkMacSystemFont,Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                        <center>
                                            <table class="container" style="width: 560px; text-align: left; border-spacing: 0; border-collapse: collapse; margin: 0 auto;">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                            <table class="row" style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="shop-name__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                                            <h1 class="shop-name__text" style="font-weight: normal; font-size: 30px; color: #333; margin: 0;"><a class="shop_name" href="https://${shop}" target="_blank" rel="noopener">{!! shop_name !!}</a></h1>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </center>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row section" style="width: 560px; border-spacing: 0; border-collapse: collapse; border-top-width: 1px; border-top-color: #e5e5e5; border-top-style: solid; text-align: left; margin: 0 auto;">
                            <tbody>
                                <tr>
                                    <td class="section__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; padding: 40px 0;">
                                        <center>
                                            <table class="container" style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                            <h3 class="quote-summary">Please find the following details</h3>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table class="container" style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td>{!! question_information !!}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </center>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row footer" style="width: 100%; border-spacing: 0; border-collapse: collapse; border-top-width: 1px; border-top-color: #e5e5e5; border-top-style: solid;">
                            <tbody>
                                <tr>
                                    <td class="footer__cell" style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; padding: 35px 0;">
                                        <center>
                                            <table class="container" style="width: 560px; text-align: left; border-spacing: 0; border-collapse: collapse; margin: 0 auto;">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: -apple-system, BlinkMacSystemFont,   Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;">
                                                            <p class="contact" style="text-align: center;">If you want to provide further information, please reply this following email.</p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </center>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;
                $.ajax({
                    url: "services.php",
                    data: {
                        action: "updateEmailTemplate",
                        shop: shop,
                        settings: self.settings
                    },
                    dataType: "JSON",
                    type: "POST"
                }).done(function (response) {
                    seft.allStores.forEach(element => {
                        if (element.store_name == shop) {
                            element.statusEmailTemplate = 0;
                        }
                    });
                    if (response == true) {
                        seft.$toasted.show("success!", {
                            type: "success",
                            duration: 3000
                        });
                    } else {
                        seft.$toasted.show("error!", {
                            type: "error",
                            duration: 3000
                        });
                    }
                });
            });
        },

        updateAllStore: function () {
            var seft = this;
            seft.showLoading = true;
            $.ajax({
                url: "services.php",
                data: {
                    action: "updateAllStore"
                },
                dataType: "JSON",
                type: "GET"
            }).done(function (response) {
                seft.showLoading = false;
                if (response == true) {
                    seft.$toasted.show("success!", {
                        type: "success",
                        duration: 3000
                    });
                } else {
                    seft.$toasted.show("error!", {
                        type: "error",
                        duration: 3000
                    });
                }
            });
        }
    }
});
