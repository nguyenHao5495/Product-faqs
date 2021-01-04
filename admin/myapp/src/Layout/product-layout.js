import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Card, Badge, Stack, TextField, Icon } from '@shopify/polaris';
import { connect } from 'react-redux';
import { Table, List } from 'antd';
import {
    CustomersMajor
} from '@shopify/polaris-icons';
import store from '../Store';

//-------------Render----------------//

const { Column } = Table;
const Productlayout = () => {
    const [dataProduct, setdataProduct] = useState();
    const [faqs, setFaqs] = useState([]);
    const [active, setActive] = useState(false);
    const [Published, setPublished] = useState([]);
    const [Unpublished, setUnpublished] = useState([]);
    const [Locked, setLocked] = useState([]);
    const [valueSearch, setValueSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setdataProduct(store.getState().store.getaProduct);
            setFaqs(store.getState().store.getaProduct.faqs)
        }, 500);
        return () => clearTimeout(timer);

    }, []);
    useEffect(() => {
        if (dataProduct) {
            setActive(true);
        } else {
            setActive(false)
        }

    }, [dataProduct]);
    useEffect(() => {
        let Published = [];
        let Unpublished = [];
        let Locked = [];
        if (faqs) {
            for (let i = 0; i < faqs.length; i++) {
                if (faqs[i].publish === "1") {
                    Published.push(faqs[i].publish)
                } else {
                    Unpublished.push(faqs[i].publish)
                }
                if (faqs[i].locked === "1") {
                    Locked.push(faqs[i].locked)
                }
            }
            setPublished(Published);
            setUnpublished(Unpublished);
            setLocked(Locked);
            console.log(faqs);
        }
    }, [faqs]);
    const handleChange = useCallback((newValue) => {
        console.log(newValue);
        setValueSearch(newValue)
    }, []);
    return (

        <div>
            {
                active
                    ? <div className="product-detail">
                        <Card sectioned>
                            <div className="product-des">
                                <div className="prodcut-image">
                                    <img src={dataProduct.imageUrl} alt={dataProduct.title} />
                                </div>
                                <div className="prodcut-title">
                                    <a href={dataProduct.productUrl} rel="noreferrer" target="_blank">{dataProduct.title}</a>
                                    <div className="margin--top--10">
                                        <Stack>
                                            <Badge className="abc">{Published.length} Published</Badge>
                                            <Badge>{Unpublished.length} Unpublished</Badge>
                                            <Badge>{Locked.length} Locked</Badge>

                                        </Stack>
                                    </div>

                                </div>
                            </div>
                        </Card>
                        <Card sectioned>
                            <div className="margin--bottom--10">
                                <TextField value={valueSearch} onChange={handleChange} placeholder="Type to Search" />
                            </div>

                            <Table
                                dataSource={faqs}
                                rowKey={data => data.id}
                                pagination={{
                                    defaultPageSize: 10,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '30']
                                }}>
                                <Column title="Question"
                                    sorter={(a, b) => a.faqs_question.length - b.faqs_question.length}
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            {record.faqs_question}
                                        </div>
                                    )} />
                                <Column title="Last Answer"
                                    sorter={(a, b) => a.answer_lists.length - b.answer_lists.length}
                                    render={(text, record) => (

                                        <div className="faqs-item" >
                                            {record.answer_lists.length > 0
                                                ? <List
                                                    dataSource={record.answer_lists}
                                                    renderItem={item => (
                                                        <div className="answer_lists">
                                                            <div className="answer_title">
                                                                <Icon
                                                                    source={CustomersMajor} />
                                                                <span className="answer_cus">{item.answer}</span>
                                                            </div>
                                                            <div className="answer_time">{item.publishdate}</div>
                                                        </div>
                                                    )}
                                                />
                                                : <div></div>
                                            }

                                        </div>
                                    )} />
                                <Column title="Date"
                                    sorter={(a, b) => new Date(a.publishdate) - new Date(b.publishdate)}
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            {record.publishdate}
                                        </div>
                                    )} />
                            </Table>
                        </Card>
                    </div>
                    : <div className="text-center">
                        <Spinner accessibilityLabel="Spinner example" size="large" color="inkLightest" />
                    </div>
            }
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        getaProduct: state.store.getaProduct,
    }
}
export default connect(mapStateToProps)(Productlayout);
