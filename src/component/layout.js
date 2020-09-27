import * as React from 'react';
import {Flex, Modal,Tag, TabBar, WingBlank} from "antd-mobile";
import {Select} from "./select";
import abi from './abi'
import BigNumber from "bignumber.js";
class Layout extends React.Component{
    constructor(props){
        super(props)
        this.state={
            modal1:false,
            account: {balances: new Map()},
        }
    }
    componentDidMount(){
        let self = this;
        abi.init
            .then(() => {
                abi.accountList(function (accounts) {
                    self.setState({account: accounts[0]});
                });
                abi.accountDetails(self.state.pk,function(account){
                  self.setState({account:account},function(){
                    self.init(account)
                  })
                })
        });
    }
    goPage=(uri)=>{
        console.log(uri);
        window.location.href=uri
        // window.open(uri)
    }
    init(account) {
        console.log(account,"Account");
        let self = this;
        let tokens = [];
        let amount = [];
        account.balances.forEach((val, key) => {
            tokens.push(key);
            amount.push(val)
            console.log(key,val,"values")
        });
        if (tokens.length == 0) {
            return;
        }

        let tokenToTokens = new Map();
        abi.getGroupTokens(account.mainPKr, tokens, function (tokens, tokenToTokens) {
            if (tokens.length > 0) {
                self.initPair(tokens[0], tokenToTokens.get(tokens[0])[0], function (pair) {
                    self.setState({
                        tokenIn: tokens[0],
                        tokenIn2:tokens[1],
                        tokenOut: tokenToTokens.get(tokens[0])[0],
                        tokens: tokens,
                        amount:amount,
                        tokenToTokens: tokenToTokens,
                        pair: pair
                    })
                  
                });
            }
          });
    }
    initPair(tokenA, tokenB, callback) {
        let self = this;
        abi.pairInfoWithOrders(this.state.account.mainPKr, tokenA, tokenB, function (pair) {
            callback(pair);
        })
    }

    showModal(){
        this.setState({
          modal1: true,
        });
    }
    onClose = key => () => {
        this.setState({
          [key]: false,
        });
      }

    showAccount(account, len) {
        if (!account || !account.mainPKr) {
            return "";
        }
        if (!len) {
            len = 8;
        }
        return account.name + " " + account.mainPKr.slice(0, len) + "..." + account.mainPKr.slice(-len)
    }

    changeAccount() {
        let self = this;

        abi.init
            .then(() => {
                abi.accountList(function (accounts) {
                    let actions = [];
                    accounts.forEach(function (account, index) {
                        actions.push(
                            {
                                text: <span>{self.showAccount(account)}</span>, onPress: () => {
                                    window.localStorage.setItem("accountPK", account.pk)
                                    if(self.props.doUpdate){
                                        self.props.doUpdate()
                                    }
                                    self.setState({account: account});
                                }
                            }
                        );
                    });
                    Modal.operation(actions);
                });
            })
    }

    getBalance = (k) =>{
        const balance = this.state.account.balances.get(k);
        if(balance){
            return new BigNumber(balance).dividedBy(10**18).toFixed(3,1)
        }else{
            return "0.000";
        }
    }

    render() {
        return (
            <div>
                <Flex className="flex showtais">
                    <Flex.Item style={{flex:1}}>
                        <div>
                            <img src={require("../images/logo.png")} alt="" width="70%"/>
                        </div>
                    </Flex.Item>
                    <Flex.Item style={{flex:1}}>
                        <div className="text-right">
                            {/*{this.props.selectedTab == "3"?<div style={{color:"#f75552"}} >初始化资金池</div>:""}*/}
                        </div>
                    </Flex.Item>
                </Flex>
                <WingBlank>
                    <div className="shares text-right padding">
                        <img onClick={()=>this.goPage("https://t.me/coralswap")} width="8%" src={require("../images/icon1.png")}/>
                        <img onClick={()=>this.goPage("https://twitter.com/CoralDEX")} width="8%" src={require("../images/icon2.png")}/>
                        <img onClick={()=>this.goPage("https://github.com/coral-dex/corswap")} width="8%" src={require("../images/icon3.png")}/>
                        <img onClick={()=>this.goPage("https://discord.gg/QM4JEKK")} width="8%" src={require("../images/icon4.png")}/>
                        <img onClick={()=>this.goPage("https://medium.com/coraldex")} width="8%" src={require("../images/icon5.png")}/>
                        <img width="8%" src={require("../images/icon6.png")} onClick={()=>this.showModal()}/>
                    </div>
                    <div className="fishing">
                        <Flex style={{width:"100%"}} onClick={() => {
                            this.changeAccount();
                        }}>
                            <Flex.Item style={{overflow:"hidden"}}>
                                {this.showAccount(this.state.account, 5)}
                            </Flex.Item>
                            <Flex.Item style={{textAlign:"right"}}>
                                {this.getBalance(["3","4"].indexOf(this.props.selectedTab)>-1?"CORALA":"SERO")} {["3","4"].indexOf(this.props.selectedTab)>-1?"CORAL":"SERO"}
                            </Flex.Item>
                        </Flex>
                    </div>
                    <div className="text-center fishing_div">
                        {/* <Tag className="fishing_tag">买币</Tag> */}
                        <img style={{position:"relative",bottom:"0",}} width="50%" src={require("../images/fishing.png")}/>
                        {/* <Tag className="fishing_tag">买币</Tag> */}
                    </div>

                    <Modal
                    visible={this.state.modal1}
                    transparent
                    maskClosable={false}
                    onClose={this.onClose('modal1')}
                    title=""
                    footer={[{ text: '我知道了', onPress: () => { console.log('ok'); this.onClose('modal1')(); } }]}
                >
                    <div style={{ height: 100, width:"auto",textAlign:"center"}}>
                        <img width="40%" src={require('../images/wx.jpg')}/>
                    </div>
                    </Modal>

                </WingBlank>

                {this.props.children}

                <div style={{ position: 'fixed',width: '100%', bottom:"0",left:"0" }}>
                    <TabBar
                        unselectedTintColor="#fff"
                        tintColor="#f75552"
                        barTintColor="#17567c"
                        // hidden={this.state.hidden}
                    >

                        <TabBar.Item
                            title="我要买"
                            key="Life"
                            icon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(./images/buy.png) center center /  21px 21px no-repeat' }}
                            />
                            }
                            selectedIcon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: 'url(./images/buyselect.png) center center /  21px 21px no-repeat' }}
                            />
                            }
                            selected={this.props.selectedTab === '1'}
                            onPress={() => {
                                this.goPage("#/buy")
                            }}
                            data-seed="logId"
                        >
                        </TabBar.Item>

                        <TabBar.Item
                            icon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: 'url(./images/sell.png) center center /  21px 21px no-repeat' }}
                                />
                            }
                            selectedIcon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: 'url(./images/sellselect.png) center center /  21px 21px no-repeat' }}
                                />
                            }
                            title="我要卖"
                            key="Koubei"
                            selected={this.props.selectedTab === '2'}
                            onPress={() => {
                                this.goPage("#/sell")
                            }}
                            data-seed="logId1"
                        >
                        </TabBar.Item>
                        <TabBar.Item
                            icon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: 'url(./images/fund.png) center center /  21px 21px no-repeat' }}
                                />
                            }
                            selectedIcon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: 'url(./images/fundselect.png) center center /  21px 21px no-repeat' }}
                                />
                            }
                            title="资金池"
                            key="Friend"
                            selected={this.props.selectedTab === '3'}
                            onPress={() => {
                                this.goPage("#/pairlist")
                            }}
                        >

                        </TabBar.Item>
                        <TabBar.Item
                            icon={{ uri: './images/dividend.png' }}
                            selectedIcon={{ uri: './images/dividendselect.png' }}
                            title="分红"
                            key="my"
                            selected={this.props.selectedTab === '4'}
                            onPress={() => {
                                this.goPage("#/shares")
                            }}
                        >
                        </TabBar.Item>
                    </TabBar>
                </div>
            </div>
        );
    }
}

export default Layout