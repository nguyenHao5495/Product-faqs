import React, { useState, useCallback, useEffect } from 'react';
import { TextField, FormLayout, Select } from '@shopify/polaris';
import { DatePicker } from 'antd';
import store from '../Store';
import moment from 'moment';
const Formlayout = (data) => {
    const [selectedQuestion, setSelectedQuestion] = useState('1');
    const [selectedAnswer, setSelectedAnswer] = useState('1');
    const [valueTimePublish, setValueTimePublish] = useState(new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
    const [valueTimeAnswer, setValueTimeAnswer] = useState(new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
    const [nameQuestion, setNameQuestion] = useState("");
    const [emailQuestion, setEmailQuestion] = useState("");
    const [contentQuestion, setContentQuestion] = useState("");
    const [nameAnswer, setNameAnswer] = useState("");
    const [emailAnswer, setEmailAnswer] = useState("");
    const [contentAnswer, setContentAnswer] = useState("");
    const options = [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' },
    ];
    const options1 = [
        { label: 'Yes', value: '1' },
        { label: 'No', value: '0' },
    ];
    useEffect(() => {
        let dataQuestion = {
            product_id: "",
            faqs_name: nameQuestion,
            faqs_email: emailQuestion,
            faqs_question: contentQuestion,
            faqs_answer_name: nameAnswer,
            faqs_answer_email: emailAnswer,
            faqs_answer: contentAnswer,
            publish: selectedQuestion,
            faqs_answer_publish: selectedAnswer,
            publishdate: valueTimePublish,
            faqs_answer_publishdate: valueTimeAnswer
        }
        store.dispatch({
            type: "DATA_QUESTION",
            dataQuestion: dataQuestion
        })
        console.log(dataQuestion);
    });
    const handleSelectChange = useCallback((value) => setSelectedQuestion(value), []);
    const handleSelectChange1 = useCallback((value) => setSelectedAnswer(value), []);
    const onChangeDateQuestion = (value, dateString) => {
        console.log(dateString);
        setValueTimePublish(dateString)
    }
    const onChangeDateAnswer = (value, dateString) => {
        console.log(dateString);
        setValueTimeAnswer(dateString)
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
    const onChangeNameAnswer = useCallback((value) => {
        setNameAnswer(value)
    }, []);
    const onChangeEmailAnswer = useCallback((value) => {
        setEmailAnswer(value)
    }, []);
    const onChangeContentAnswer = useCallback((value) => {
        setContentAnswer(value)
    }, []);
    return (
        <div>
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
                <FormLayout.Group condensed>
                    <TextField label="Name" value={nameAnswer} onChange={onChangeNameAnswer} />
                    <TextField label="Email" value={emailAnswer} onChange={onChangeEmailAnswer} />
                </FormLayout.Group>
                <TextField label="Answer" value={contentAnswer} onChange={onChangeContentAnswer} />
                <FormLayout.Group condensed>
                    <Select
                        label="Publish this Answer"
                        options={options1}
                        onChange={handleSelectChange1}
                        value={selectedAnswer}
                    />
                    <div className="date_time">
                        <label>Publish date</label>
                        <DatePicker
                            value={moment(valueTimeAnswer, "DD/MM/YYYY HH:mm")}
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            onChange={onChangeDateAnswer} />
                    </div>
                </FormLayout.Group>
            </FormLayout>
        </div>
    );
}

export default Formlayout;
