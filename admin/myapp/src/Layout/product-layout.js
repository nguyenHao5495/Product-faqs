import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Card, Badge, Stack, TextField, Icon, Button, Modal, TextContainer } from '@shopify/polaris';
import { connect } from 'react-redux';
import { Table, List } from 'antd';
import axios from 'axios';
import Config from '../config/config'
import {
    ConversationMinor,
    DeleteMinor,
    EditMinor
} from '@shopify/polaris-icons';
import store from '../Store';

//-------------Render----------------//

const { Column } = Table;

let dataTest = []
const Productlayout = () => {
    const [dataProduct, setdataProduct] = useState();
    const [faqs, setFaqs] = useState(dataTest);
    const [active, setActive] = useState(false);
    const [activeModal, setActiveModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [Published, setPublished] = useState([]);
    const [Unpublished, setUnpublished] = useState([]);
    const [Locked, setLocked] = useState([]);
    const [valueSearch, setValueSearch] = useState("");
    const [id, setId] = useState("");
    const [lock, setLock] = useState({});
    useEffect(() => {
        const timer = setTimeout(() => {
            setdataProduct(store.getState().store.getaProduct);
            setFaqs(store.getState().store.getaProduct.faqs);
            dataTest = store.getState().store.getaProduct.faqs;
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

        setValueSearch(newValue);
        if (newValue !== "") {
            let results = faqs.filter(person => {
                return (
                    person.faqs_question.toLowerCase().includes(newValue.toLowerCase()) ||
                    person.publishdate.toLowerCase().includes(newValue.toLowerCase()) ||
                    person.faqs_name
                        .toString()
                        .toLowerCase()
                        .includes(newValue.toLowerCase())
                );
            });
            console.log("results", results);

            setFaqs(results);
        } else {
            setFaqs(dataTest)
        }
    }, []);
    const handleChangeModal = useCallback((id) => {
        setTitle("Lock this question?");
        setLock({
            content: 'Agree',
            onAction: lockFaqbyApi,
        })
        setContent("Are you sure you want to lock this question? No one can reply this.")
        if (id) {
            setId(id);
            setActiveModal(!activeModal)
        }

    }, [activeModal]);
    const handleChangeModalUnlock = useCallback((id) => {
        if (id) {
            setId(id);
            setActiveModal(!activeModal)
        }
        setTitle("Unlock this question?");
        setLock({
            content: 'Agree Test',
            onAction: UnlockFaqbyApi,
        })
        setContent("Are you sure you want to lock this question? No one can reply this.")


    }, [activeModal]);
    const lockFaqbyApi = () => {
        let formData = new FormData();
        formData.append("id", id);
        formData.append("shop", Config.shop);
        formData.append("action", "lockQuestion");
        axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
            .then(data => {
                if (data) {
                    setActiveModal(false)
                }
            })
            .catch(error => console.log(error));
    }

    const UnlockFaqbyApi = () => {
        console.log(id);
        const productId = store.getState().store.getaProduct.id
        if (productId) {
            const test = () => {
                axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getQuestionsByProductId&shop=${Config.shop}&id=${productId}`)
                    .then(data => {
                        console.log(data.data);
                        setFaqs(data.data.faqs)
                        setActiveModal(false);

                    })
                    .catch(error => console.log(error));
            }
            let formData = new FormData();
            formData.append("id", id);
            formData.append("shop", Config.shop);
            formData.append("action", "unlockQuestion");
            axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    if (data) {
                        test()
                    }
                })
                .catch(error => console.log(error));
        }

    }

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
                                        <Stack spacing="extraTight">
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
                                                                    source={ConversationMinor} />
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
                                <Column title="Author"
                                    sorter={(a, b) => a.faqs_name.length - b.faqs_name.length}
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            <h3>{record.faqs_name}</h3>
                                        </div>
                                    )} />
                                <Column title="Date"
                                    sorter={(a, b) => new Date(a.publishdate) - new Date(b.publishdate)}
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            {record.publishdate}
                                        </div>
                                    )} />
                                <Column title={(
                                    <div className="bold">Status</div>
                                )}
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            <Stack spacing="extraTight">
                                                {
                                                    record.publish === "1"
                                                        ? <div className="Published">
                                                            <Badge>Published</Badge>
                                                        </div>
                                                        : <Badge>Unpublished</Badge>
                                                }
                                                {
                                                    record.locked === "1"
                                                        ? <Badge>Locked</Badge>
                                                        : ""
                                                }
                                            </Stack>

                                        </div>
                                    )} />

                                <Column title={(
                                    <div className="bold">Action</div>
                                )}
                                    render={(text, record) => (
                                        <div className="faqs-edit" >
                                            <div className="lock">
                                                {
                                                    record.locked === "0"
                                                        ? <Button plain onClick={() => handleChangeModal(record.id)}>
                                                            <i className="fas fa-lock"></i>

                                                        </Button>
                                                        : <Button plain onClick={() => handleChangeModalUnlock(record.id)}>
                                                            <i className="fas fa-unlock-alt"></i>

                                                        </Button>
                                                }
                                            </div>
                                            <div className="edit">
                                                <Button plain>
                                                    <Icon
                                                        source={EditMinor} />
                                                </Button>
                                            </div>
                                            <div className="delete">
                                                <Button plain>
                                                    <Icon className="abc"
                                                        source={DeleteMinor} />
                                                </Button>
                                            </div>

                                        </div>
                                    )} />
                            </Table>
                        </Card>
                    </div>
                    : <div className="text-center">
                        <Spinner accessibilityLabel="Spinner example" size="large" color="inkLightest" />
                    </div>
            }
            <Modal
                open={activeModal}
                onClose={() => setActiveModal(false)}
                title={title}

                primaryAction={lock}
                secondaryActions={[
                    {
                        content: 'Disagree',
                        onAction: handleChangeModal,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            {content}
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        getaProduct: state.store.getaProduct,
    }
}
export default connect(mapStateToProps)(Productlayout);
