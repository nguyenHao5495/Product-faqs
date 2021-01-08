import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Config from '../config/config';
import { Modal, TextContainer, Frame, Toast, TextField, FormLayout, Select } from '@shopify/polaris';
import { DatePicker } from 'antd';

import moment from 'moment';
const EditLayout = (dataFaqs) => {
    const [htmlList, setHtmlList] = useState([]);
    const [activeModal, setActiveModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState();
    const [lock, setLock] = useState({});
    const [error, setError] = useState(false);
    const [activeToast, setactiveToast] = useState(false);
    const [toast, setToast] = useState("");
    const [nameQuestion, setNameQuestion] = useState("");
    const [emailQuestion, setEmailQuestion] = useState("");
    const [contentQuestion, setContentQuestion] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState('1');
    const [valueTimePublish, setValueTimePublish] = useState(new Date());
    const options = [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' },
    ];
    const options1 = [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' },
    ];
    useEffect(() => {
        console.log(dataFaqs);
        setHtmlList(prevArray => [...prevArray, ...dataFaqs.data.answer_lists]);
        setNameQuestion(dataFaqs.data.faqs_name);
        setEmailQuestion(dataFaqs.data.faqs_email);
        setContentQuestion(dataFaqs.data.faqs_question);
        setValueTimePublish(dataFaqs.data.publishdate);
        setSelectedQuestion(dataFaqs.data.publish)
    }, [dataFaqs]);
    const test = useCallback((data, value, index) => {
        console.log(value);
        const id = [...htmlList];
        for (let i = 0; i < id.length; i++) {
            if (i === index) {
                id[i].name = value
            }
        }

        setHtmlList(id);
        console.log(htmlList);
    })
    const listItems = htmlList.map((item, index) =>
        <FormLayout key={index}>
            <FormLayout.Group condensed>
                <TextField label="Name" value={item.name} onChange={(value) => test(item, value, index)} />
                <TextField label="Email" value={item.email} />
            </FormLayout.Group>
            <TextField label="Answer" value={item.answer} />
            <FormLayout.Group condensed>
                <Select
                    label="Publish this question"
                    options={options}
                    value={item.publish}
                />
                <div className="date_time">
                    <label>Publish date</label>
                    <DatePicker
                        value={moment(item.publishdate, "DD/MM/YYYY HH:mm")}
                        showTime={{ format: 'HH:mm' }}
                        format="DD/MM/YYYY HH:mm"
                    />
                </div>
            </FormLayout.Group>
            <div className="text-right">
                <button onClick={() => removeAnswerModal(item.id, index)}>removeAnswer</button>
            </div>
        </FormLayout>
    );

    const removeAnswerModal = (id, index) => {
        if (id) {
            setError(false);
            setTitle("Delete this Answer?");
            setLock({
                content: 'Agree',
                destructive: true,
                onAction: () => removeAnswer(id, index),
            })
            setContent("Are you sure you want to Delete this Answer? No one can reply this.");
            setActiveModal(!activeModal);
        } else {
            let temp = [...htmlList];
            temp.splice(index, 1);
            console.log(temp, index);
            setHtmlList(temp)
        }
    };
    const removeAnswer = (id, index) => {
        console.log(htmlList);
        setActiveModal(false);
        if (id !== "") {
            let formData = new FormData();
            formData.append("id", id);
            formData.append("shop", Config.shop);
            formData.append("action", "deleteAnswer");
            axios.post(`${Config.rootLink}/admin/functions/faqs.php`, formData)
                .then(data => {
                    let temp = [...htmlList];
                    temp.splice(index, 1);
                    setHtmlList(temp);
                    setActiveModal(false);
                    setactiveToast(true);
                    setToast("Delete is Success !!!");
                    dataFaqs.resetFaqs1();
                })
                .catch(error => {
                    setactiveToast(true);
                    setToast("Delete Failed !!!")
                });
        } else {
            let temp = [...htmlList];
            temp.splice(index, 1);
            setHtmlList(temp)
            //setHtmlList(htmlList.slice(index, 1))
        }
    }

    const addTest = () => {
        let datatesst = {
            id: "",
            name: "",
            email: "",
            publish: "1",
            publishdate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
            answer: "",
            newAnswer: "1"
        }
        setHtmlList(oldArray => [...oldArray, datatesst]);
    }
    const onChangeNameQuestion = useCallback((value) => {
        setNameQuestion(value)
    }, []);
    const onChangeEmailQuestion = useCallback((value) => {
        setEmailQuestion(value)
    }, []);
    const onChangeContentQuestion = useCallback((value) => {
        setContentQuestion(value)
    }, []);
    const onChangeDateQuestion = (value, dateString) => {
        console.log(dateString);
        setValueTimePublish(dateString)
    }
    const handleSelectChange = useCallback((value) => setSelectedQuestion(value), []);
    //const handleSelectChange1 = useCallback((value) => setSelectedAnswer(value), []);
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
    return (
        <div className="posion-relative">
            <FormLayout>
                <FormLayout.Group condensed>
                    <TextField label="Name" value={nameQuestion} onChange={onChangeNameQuestion} />
                    <TextField label="Email" value={emailQuestion} onChange={onChangeEmailQuestion} />
                </FormLayout.Group>
                <TextField label="Question" value={contentQuestion} onChange={onChangeContentQuestion} />
                <FormLayout.Group condensed>
                    <Select
                        label="Publish this question"
                        options={options}
                        onChange={handleSelectChange}
                        value={selectedQuestion}
                    />
                    <div className="date_time">
                        <label>Publish date</label>
                        <DatePicker
                            value={moment(valueTimePublish, "DD/MM/YYYY HH:mm")}
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            onChange={onChangeDateQuestion} />
                    </div>
                </FormLayout.Group>
                <div className="margin--top--20">
                    <strong>Answer</strong>
                </div>

            </FormLayout>
            {listItems}
            <button onClick={addTest}>Add</button>
            <button onClick={() => console.log(htmlList)}>listItems</button>
            <Modal
                open={activeModal}
                onClose={() => setActiveModal(false)}
                title={title}
                primaryAction={lock}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: closePopup,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        {content}
                    </TextContainer>
                </Modal.Section>
            </Modal>
            <div className="hidden">
                <Frame>
                    {toastMarkup}
                </Frame>
            </div>
        </div>
    );
}

export default EditLayout;
