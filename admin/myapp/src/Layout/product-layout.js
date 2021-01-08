import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Card, Badge, Stack, TextField, Icon, Button, Modal, TextContainer, Frame, Toast } from '@shopify/polaris';
import { connect } from 'react-redux';
import { Table, List } from 'antd';
import axios from 'axios';
import Config from '../config/config'
import {
    ConversationMinor,
    DeleteMinor,
    EditMinor,
    PlusMinor
} from '@shopify/polaris-icons';
import store from '../Store';
import Formlayout from './form-layout';
import EditLayout from './Edit-layout';

//-------------Render----------------//

const { Column } = Table;
let dataTest = []
const Productlayout = () => {
    const [dataProduct, setdataProduct] = useState();
    const [faqs, setFaqs] = useState(dataTest);
    const [active, setActive] = useState(false);
    const [activeModal, setActiveModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState();
    const [Published, setPublished] = useState([]);
    const [Unpublished, setUnpublished] = useState([]);
    const [Locked, setLocked] = useState([]);
    const [valueSearch, setValueSearch] = useState("");

    const [lock, setLock] = useState({});
    const [close, setClose] = useState({});
    const [activeToast, setactiveToast] = useState(false);
    const [toast, setToast] = useState("");
    const [error, setError] = useState(false);
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
            const results = faqs.filter(person => {
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
    }, [faqs]);

    const handleChangeModal = useCallback((id) => {
        console.log(id);
        setError(false);
        if (id) {
            setTitle("Lock this question?");
            setLock({
                content: 'Agree',
                destructive: true,
                onAction: () => lockFaqbyApi(id),
            })
            setClose({
                content: 'Close',
                onAction: closePopup,
            })
            setContent("Are you sure you want to lock this question? No one can reply this.");
            setActiveModal(!activeModal);
        }

    }, [activeModal]);
    const handleChangeModalUnlock = useCallback((id) => {
        setError(false);
        if (id) {
            setTitle("Unlock this question?");
            setLock({
                content: 'Agree Test',
                destructive: true,
                onAction: () => UnlockFaqbyApi(id),
            })
            setClose({
                content: 'Close',
                onAction: closePopup,
            })
            setContent("Are you sure you want to lock this question? No one can reply this.");
            setActiveModal(!activeModal);
        }
    }, [activeModal]);
    const deleteChangeModal = useCallback((id) => {
        console.log(id);
        setError(false);
        if (id) {
            setTitle("Delete this question?");
            setLock({
                content: 'Delete',
                destructive: true,
                onAction: () => DeleteFaqbyApi(id),
            })
            setClose({
                content: 'Close',
                onAction: closePopup,
            })
            setContent("Are you sure you want to delete this question? This action cannot be undone.");
            setActiveModal(!activeModal);
        }
    }, [activeModal]);
    const EditChangeModal = useCallback((data) => {
        setError(false);
        if (data) {
            setTitle("Edit question");
            setLock("")
            setClose("")
            setContent(
                <EditLayout data={data} resetFaqs1={resetFaqs1} />
            )
            setActiveModal(!activeModal);
        }
    }, [activeModal]);
    const lockFaqbyApi = (id) => {
        if (id) {
            let formData = new FormData();
            formData.append("id", id);
            formData.append("shop", Config.shop);
            formData.append("action", "lockQuestion");
            axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    resetFaqs()
                    setActiveModal(false)
                })
                .catch(error => {
                    console.log(error);
                    setactiveToast(true);
                    setToast("Lock Question is Failed !!!")
                });
        } else {
            setActiveModal(false);
            setError(true);
            setactiveToast(true);
            setToast("Lock Question is Failed !!!")
        }
    }
    const resetFaqs = () => {
        const productId = store.getState().store.getaProduct.id
        axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getQuestionsByProductId&shop=${Config.shop}&id=${productId}`)
            .then(data => {
                setFaqs(data.data.faqs)
                setActiveModal(false);
            })
            .catch(error => console.log(error));
    }
    const resetFaqs1 = () => {
        const productId = store.getState().store.getaProduct.id
        axios.get(`${Config.rootLink}/admin/functions/faqs.php?action=getQuestionsByProductId&shop=${Config.shop}&id=${productId}`)
            .then(data => {
                setFaqs(data.data.faqs)
            })
            .catch(error => console.log(error));
    }
    const UnlockFaqbyApi = (id) => {
        if (id) {
            let formData = new FormData();
            formData.append("id", id);
            formData.append("shop", Config.shop);
            formData.append("action", "unlockQuestion");
            axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    resetFaqs()
                    setActiveModal(false)
                })
                .catch(error => {
                    console.log(error);
                    setactiveToast(true);
                    setToast("Unlock Question is Failed !!!")
                });
        } else {
            setActiveModal(false);
            setError(true);
            setactiveToast(true);
            setToast("Unlock Question is Failed !!!")
        }
    }
    const DeleteFaqbyApi = (id) => {
        if (id) {
            let formData = new FormData();
            formData.append("id", id);
            formData.append("shop", Config.shop);
            formData.append("action", "deleteQuestion");
            axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    setActiveModal(false);
                    resetFaqs();
                    setactiveToast(true);
                    setToast("Delete Question is Success !!!")
                })
                .catch(error => {
                    console.log(error);
                    setactiveToast(true);
                    setToast("Delete Question is Failed !!!")
                });
        } else {
            setActiveModal(false);
            setError(true);
            setactiveToast(true);
            setToast("Delete Question is Failed !!!")
        }
    };
    const closePopup = useCallback(() => setActiveModal(!activeModal), [activeModal]);
    const toggleActive = useCallback(() => setactiveToast((activeToast) => !activeToast), []);
    const toastMarkup = activeToast ? (
        error === true ? <Toast
            content={toast}
            error={error}
            onDismiss={toggleActive}
            duration={3000} />
            : <Toast
                content={toast}
                onDismiss={toggleActive}
                duration={3000} />

    ) : null;
    const modalPopUpForm = async (id) => {
        if (id) {
            setTitle("Create new question");
            setLock({
                content: 'Save',
                Primary: false,
                onAction: addNewQuestion
            })
            setClose({
                content: 'Close',
                onAction: closePopup,
            })
            setContent(
                <Formlayout />
            )
            setActiveModal(!activeModal);
        }

    }
    const addNewQuestion = async () => {
        const dataId = {
            product_id: dataProduct.id.toString()
        }
        let dataFormNew = Object.assign({}, store.getState().store1.dataQuestion, dataId);
        console.log(dataFormNew);
        if (dataFormNew) {
            let formData = new FormData();
            formData.append("faqs", JSON.stringify(dataFormNew));
            formData.append("shop", Config.shop);
            formData.append("action", "addNewQuestion");

            await axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    if (data) {
                        setActiveModal(false);
                        resetFaqs();
                        setactiveToast(true);
                        setToast("Add Question is Success !!!")
                    }
                })
                .catch(error => {
                    console.log(error);
                    setactiveToast(true);
                    setToast("Add Question is Failed !!!")
                });
        } else {
            setActiveModal(false);
            setError(true);
            setactiveToast(true);
            setToast("Add Question is Failed !!!")
        }
    };
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
                                    <div className="margin--top--20 addQuestion">
                                        <Button primary onClick={() => modalPopUpForm(dataProduct.id)}>
                                            <Icon source={PlusMinor} />Create new question</Button>
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
                                    width='35%'
                                    render={(text, record) => (
                                        <div className="faqs-item" >
                                            {record.answer_lists.length > 0
                                                ? <List
                                                    dataSource={record.answer_lists}
                                                    renderItem={item => (
                                                        <div className="answer_lists">
                                                            <div className="answer_title">

                                                                <span className="answer_cus"><Icon
                                                                    source={ConversationMinor} />{item.answer}</span>
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
                                                <Button plain onClick={() => EditChangeModal(record)}>
                                                    <Icon
                                                        source={EditMinor} />
                                                </Button>
                                            </div>
                                            <div className="delete">
                                                <Button plain onClick={() => deleteChangeModal(record.id)}>
                                                    <Icon className="abc"
                                                        source={DeleteMinor} />
                                                </Button>
                                            </div>

                                        </div>
                                    )} />
                            </Table>
                        </Card>
                        <div className="hidden">
                            <Frame>
                                {toastMarkup}
                            </Frame>
                        </div>



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

                secondaryActions={close}
            >
                <Modal.Section>
                    <TextContainer>
                        {content}
                    </TextContainer>
                </Modal.Section>
            </Modal>


        </div >
    );
}
const mapStateToProps = (state) => {
    console.log(state);
    if (state.store1) {
        return {
            getaProduct: state.store.getaProduct,
            dataQuestion: state.store1.dataQuestion
        }
    } else {
        return {
            getaProduct: state.store.getaProduct
        }
    }

}
export default connect(mapStateToProps)(Productlayout);
