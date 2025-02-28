/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import dis from '../../../dispatcher';
import { _t } from '../../../languageHandler';
import LogoutDialog from "../dialogs/LogoutDialog";
import Modal from "../../../Modal";
import SdkConfig from '../../../SdkConfig';
import { getHostingLink } from '../../../utils/HostingLink';
import MatrixClientPeg from '../../../MatrixClientPeg';
import sdk from "../../../index";

export class TopLeftMenu extends React.Component {
    static propTypes = {
        displayName: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        onFinished: PropTypes.func,

        // Optional function to collect a reference to the container
        // of this component directly.
        containerRef: PropTypes.func,
    };

    constructor() {
        super();
        this.viewHomePage = this.viewHomePage.bind(this);
        this.openSettings = this.openSettings.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    hasHomePage() {
        const config = SdkConfig.get();
        const pagesConfig = config.embeddedPages;
        if (pagesConfig && pagesConfig.homeUrl) {
            return true;
        }
        // This is a deprecated config option for the home page
        // (despite the name, given we also now have a welcome
        // page, which is not the same).
        return !!config.welcomePageUrl;
    }

    render() {
        const AccessibleButton = sdk.getComponent('elements.AccessibleButton');

        const isGuest = MatrixClientPeg.get().isGuest();

        const hostingSignupLink = getHostingLink('user-context-menu');
        let hostingSignup = null;
        if (hostingSignupLink) {
            hostingSignup = <div className="mx_TopLeftMenu_upgradeLink">
                {_t(
                    "<a>Upgrade</a> to your own domain", {},
                    {
                        a: sub => <a href={hostingSignupLink} target="_blank" rel="noopener" tabIndex="0">{sub}</a>,
                    },
                )}
                <a href={hostingSignupLink} target="_blank" rel="noopener" aria-hidden={true}>
                    <img src={require("../../../../res/img/external-link.svg")} width="11" height="10" alt='' />
                </a>
            </div>;
        }

        let homePageItem = null;
        if (this.hasHomePage()) {
            homePageItem = (
                <AccessibleButton element="li" className="mx_TopLeftMenu_icon_home" onClick={this.viewHomePage}>
                    {_t("Home")}
                </AccessibleButton>
            );
        }

        let signInOutItem;
        if (isGuest) {
            signInOutItem = (
                <AccessibleButton element="li" className="mx_TopLeftMenu_icon_signin" onClick={this.signIn}>
                    {_t("Sign in")}
                </AccessibleButton>
            );
        } else {
            signInOutItem = (
                <AccessibleButton element="li" className="mx_TopLeftMenu_icon_signout" onClick={this.signOut}>
                    {_t("Sign out")}
                </AccessibleButton>
            );
        }

        const settingsItem = (
            <AccessibleButton element="li" className="mx_TopLeftMenu_icon_settings" onClick={this.openSettings}>
                {_t("Settings")}
            </AccessibleButton>
        );

        return <div className="mx_TopLeftMenu mx_HiddenFocusable" tabIndex={0} ref={this.props.containerRef}>
            <div className="mx_TopLeftMenu_section_noIcon" aria-readonly={true}>
                <div>{this.props.displayName}</div>
                <div className="mx_TopLeftMenu_greyedText" aria-hidden={true}>{this.props.userId}</div>
                {hostingSignup}
            </div>
            <ul className="mx_TopLeftMenu_section_withIcon">
                {homePageItem}
                {settingsItem}
                {signInOutItem}
            </ul>
        </div>;
    }

    viewHomePage() {
        dis.dispatch({action: 'view_home_page'});
        this.closeMenu();
    }

    openSettings() {
        dis.dispatch({action: 'view_user_settings'});
        this.closeMenu();
    }

    signIn() {
        dis.dispatch({action: 'start_login'});
        this.closeMenu();
    }

    signOut() {
        Modal.createTrackedDialog('Logout E2E Export', '', LogoutDialog);
        this.closeMenu();
    }

    closeMenu() {
        if (this.props.onFinished) this.props.onFinished();
    }
}
