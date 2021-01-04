import React, { useEffect, useState } from 'react';
import { Card, Button, Page } from '@shopify/polaris';
import { Table } from 'antd';
import Config from '../config/config'
import axios from 'axios';
import Productlayout from '../Layout/product-layout';
import store from '../Store';
const { Column } = Table;
const ProductList = () => {
    const [data, setData] = useState([]);
    const [product, setProduct] = useState({});
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getProducts&shop=${Config.shop}&page=0&flag=0&since_id=0`)
            .then(data => {
                if (data) {
                    setData(data.data.products);
                    setLoading(false);
                }

            })
            .catch(error => console.log(error));
    }, []);
    const resetData = () => {
        setLoading(true);
        axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getProducts&shop=${Config.shop}&page=1&flag=0&since_id=0`)
            .then(data => {
                if (data) {
                    setData(data.data.products);
                    setLoading(false);
                }

            })
            .catch(error => console.log(error));
    }
    const getAProduct = (data) => {
        axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getQuestionsByProductId&shop=${Config.shop}&id=${data.id}`)
            .then(data => {
                if (data) {
                    setProduct(data.data);
                    store.dispatch({
                        type: "DATA_PRODUCT",
                        getaProduct: data.data
                    })
                    setActive(true)
                }

            })
            .catch(error => console.log(error));
    }
    return (
        <div>
            {
                active
                    ? <Page
                        breadcrumbs={[{ content: 'Products', onAction: () => setActive(!product) }]}
                    >
                        <Productlayout />
                    </Page>
                    : <Card sectioned>
                        <div className="margin--bottom--20">
                            <Button primary loading={loading} onClick={resetData}>Reset product</Button>
                        </div>
                        <Table
                            dataSource={data}
                            rowKey={data => data.id}
                            pagination={{
                                defaultPageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '30']
                            }}>
                            <Column title="Product"
                                sorter={(a, b) => a.title.length - b.title.length}
                                render={(text, record) => (
                                    <div className="product-item" >
                                        <div className="product-image">
                                            <img src={record.image.src} alt={record.title} />
                                        </div>
                                        <div className="product-title">
                                            <Button plain monochrome onClick={() => getAProduct(record)}>{record.title}</Button>
                                        </div>
                                    </div>
                                )} />
                            <Column title="Questions"
                                sorter={(a, b) => a.faqs - b.faqs}
                                render={(text, record) => (
                                    <div >
                                        {record.faqs} questions
                                    </div>
                                )} />
                            <Column title="Action"
                                render={(text, record) => (
                                    <div >
                                        {record.id}
                                    </div>
                                )} />
                        </Table>
                    </Card>
            }

        </div>
    );
}

export default ProductList;
