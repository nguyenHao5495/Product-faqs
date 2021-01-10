import React, { useState, useCallback } from 'react';
import { Card, Layout, ButtonGroup, Button, Checkbox, TextField } from '@shopify/polaris';
const SettingsApp = () => {
   const [isFirstButtonActive, setIsFirstButtonActive] = useState(false);
   const [sendEmail, setSendEmail] = useState(false);
   const [sendCustomer, setSendCustomer] = useState(false);
   const [valuePerpage, setValuePerpage] = useState('2');
   const [valuePerpageText, setValuePerpageText] = useState('255');

   const handleFirstButtonClick = useCallback(() => {
      if (isFirstButtonActive) return;
      setIsFirstButtonActive(true);
   }, [isFirstButtonActive]);
   console.log(isFirstButtonActive);
   const handleSecondButtonClick = useCallback(() => {
      if (!isFirstButtonActive) return;
      setIsFirstButtonActive(false);
   }, [isFirstButtonActive]);

   const handleChangeSendEmail = useCallback((newChecked) => {
      setSendEmail(newChecked)
   }, []);
   const handleChangeSendCustomer = useCallback((newChecked) => {
      setSendCustomer(newChecked)
   }, []);
   const handleChangePerPage = useCallback((newValue) => setValuePerpage(newValue), []);
   const handleChangePerPageText = useCallback((newValue) => setValuePerpageText(newValue), []);
   return (
      <div className="settingsApp">
         <Layout>
            <Layout.AnnotatedSection
               title="Auto publish new questions"
            >
               <Card sectioned>
                  <div className="settingsApp_enable">
                     <ButtonGroup segmented>
                        <Button pressed={isFirstButtonActive} onClick={handleFirstButtonClick}>
                           Enabled
                        </Button>
                        <Button pressed={!isFirstButtonActive} onClick={handleSecondButtonClick}>
                           DisaBled
                        </Button>
                     </ButtonGroup>
                  </div>
               </Card>
            </Layout.AnnotatedSection>
         </Layout>
         <hr />
         <Layout>
            <Layout.AnnotatedSection
               title="Email settings"
            >
               <Card sectioned>
                  <Checkbox
                     label="Send me an email when a question is submited"
                     checked={sendEmail}
                     onChange={handleChangeSendEmail} />
                  <div className="margin--top--20">
                     <Checkbox
                        label="Send customer a confirmation mail"
                        checked={sendCustomer}
                        onChange={handleChangeSendCustomer} />
                  </div>
               </Card>
            </Layout.AnnotatedSection>
         </Layout>
         <hr />
         <Layout>
            <Layout.AnnotatedSection
               title="General Settings"
            >
               <Card sectioned>
                  <div className="margin--bottom--20">
                     <TextField
                        label="Questions Per Page"
                        type="number"
                        value={valuePerpage}
                        onChange={handleChangePerPage}
                        helpText="(Value between 2 and 50)"
                     />
                  </div>
                  <div className="margin--bottom--20">
                     <TextField
                        label="Questions Per Page"
                        type="number"
                        value={valuePerpageText}
                        onChange={handleChangePerPageText}
                        helpText="(Value between 100 and 2000)"
                     />
                  </div>
               </Card>
            </Layout.AnnotatedSection>
         </Layout>
      </div>
   );
}

export default SettingsApp;
