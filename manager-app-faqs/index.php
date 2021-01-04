
<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Product FAQs Manager Store</title>
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
            <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap/dist/css/bootstrap.min.css"/>
            <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css"/>
            <link rel="stylesheet" href="../admin/lib/vue-multiselect.min.css">
            <link rel="stylesheet" href="vue-toasted/vue-toasted.min.css">
            <link type="text/css" rel="stylesheet" href="style.css?v=<?php echo time() ?>"/>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        </head>
        <body>
        <div id="manage-store">  
            <b-container >
                <h1>Manager App Product FAQs</h1>
                <div class="ot-content-table">
                    <div class="row" style="padding:15px">
                        <div class="col-md-6">
                            <b-form-input v-model="filter"  type="search" id="filterInput"  placeholder="Type to Search" ></b-form-input>
                        </div>
                        <div class="col-md-6">
                            <b-button style="float:right" variant="outline-primary" @click="updateAllStore" v-if="showLoading == false">Update All Store</b-button>
                            <b-button style="float:right" variant="outline-primary" disabled v-else><i class="fas fa-spinner fa-spin"></i> Update All Store</b-button>
                        </div>
                    </div>
                    <div class="row" style="padding:0px 15px;">
                        <div class="col-md-12">
                            <b-table
                                show-empty
                                stacked="md"
                                :items="allStores"
                                :fields="fields"
                                :current-page="currentPage"
                                :per-page="perPage"
                                :filter="filter"
                                @filtered="onFiltered"
                                >
                                <template slot="store_name" slot-scope="row">
                                    <a :href="'https://'+row.value" target="_blank">{{row.value}}</a>
                                </template>
                                <template slot="action" slot-scope="row">
                                    <b-button variant="outline-primary" @click="updateDataCache(row.item.store_name)" v-if="row.item.status == 0">Update cache</b-button>
                                    <b-button variant="outline-primary" disabled v-else>   <i class="fas fa-spinner fa-spin"></i> Update cache</b-button>
                                    <b-button variant="outline-primary" @click="deleteDataCache(row.item.store_name)" v-if="row.item.status_cache == 0">Delete cache file</b-button>
                                    <b-button variant="outline-primary" disabled v-else>   <i class="fas fa-spinner fa-spin"></i> Delete cache file</b-button>
                                    <b-button variant="outline-primary" @click="updateEmailTemplate(row.item.store_name)" v-if="row.item.statusEmailTemplate == 0">Update Email Template</b-button>
                                    <b-button variant="outline-primary" disabled v-else><i class="fas fa-spinner fa-spin"></i> Update Email Template</b-button>
                                </template>
                            </b-table>
                        </div>
                    </div>
                    <div class="row" style="padding:0px 15px;margin-top:15px">
                        <div class="col-md-11">
                            <b-pagination
                                v-model="currentPage"
                                :total-rows="totalRows"
                                :per-page="perPage"
                                ></b-pagination>
                        </div>
                        <div class="col-md-1">
                        <b-form-select
                            v-model="perPage"
                            id="perPageSelect"
                            :options="pageOptions"
                        ></b-form-select>
                        </div>
                   </div>
                </div>  
            </b-container>
        </div> 
        <script src="../admin/lib/jquery.min.js"></script>
        <script src="../admin/lib/vue.js"></script>
        <script src="../admin/lib/bootstrap-vue.js"></script>  
        <script type="text/javascript" src="../admin/lib/vue-multiselect.min.js"></script>
        <script type="text/javascript" src="vue-toasted/vue-toasted.min.js"></script>
        <script type="text/javascript" src="../admin/lib/httpVueLoader.js"></script>
        <script src="main.js?v=1"></script> 
    </body>
</html>