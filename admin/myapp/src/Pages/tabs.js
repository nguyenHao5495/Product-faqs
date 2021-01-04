import React, { useCallback, useState } from 'react';
import { Tabs, Icon } from '@shopify/polaris';
import ProductList from '../Components/ProductList';
import {
    QuestionMarkMajor,
    SettingsMajor,
    EmailMajor
} from '@shopify/polaris-icons';
const TabsFunction = () => {
    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    );
    const tabs = [
        {
            id: 'product-list',
            content: (
                <div className="title_tabs">
                    <span>
                        Product List
                    </span>
                    <Icon
                        source={QuestionMarkMajor} />
                </div>
            ),
            data: (
                <ProductList />
            ),
            accessibilityLabel: 'Product List',
            panelID: 'Product-content',
        },
        {
            id: 'settings-app',
            content: (
                <div className="title_tabs">
                    <span>
                        Settings General
                    </span>
                    <Icon
                        source={SettingsMajor} />
                </div>
            ),
            data: (
                <ProductList />
            ),
            panelID: 'accepts-marketing-content',
        },
        {
            id: 'email-settings',
            content: (
                <div className="title_tabs">
                    <span>
                        Email Settings
                    </span>
                    <Icon
                        source={EmailMajor} />
                </div>
            ),

            data: (
                <ProductList />
            ),
            panelID: 'repeat-customers-content',
        },
        {
            id: 'prospects',
            content: (
                <div className="title_tabs">
                    <span>
                        Email Settings
                    </span>
                    <Icon
                        source={EmailMajor} />
                </div>
            ),
            data: (
                <ProductList />
            ),
            panelID: 'prospects-content',
        },
    ];
    return (
        <div>
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                <div className="wrapper">
                    {tabs[selected].data}
                </div>
            </Tabs>
        </div>
    );
}

export default TabsFunction;
