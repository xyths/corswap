import React, {Component} from 'react';
import {
    Flex,
    List,
} from "antd-mobile";
import abi from "./abi";
import {dateFormat, showValue} from './utils/common'
import {Select} from "./select";
import BigNumber from "bignumber.js";
import '../style/style.css'
import Layout from "./layout";
import {bnToHex} from './utils/common'
import i18n from '../i18n'
export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            selected: 'zh_CN',
            selectedTab: 'redTab',
            hidden: false,
            fullScreen: false,
            modal1: false,
            modal2:false,
            pk: localStorage.getItem("accountPK"),
            account: {balances: new Map()},
            tokens: [],
            amount: [],
            tokenToTokens: new Map(),
            tokenInAmount: null,
            tokenOutAmount: null,
            orderType: 0,
            modal: false,
            flag: true,
            option1: '',
            option2: '',
            inputStyle:null,
            out:null,
            showModal:false,
            showModal2:false,

        }
    }

    init(account) {
        let self = this;
        // let tokens = [];
        let amount = [];
        console.log(account,"----!!!");
        account.balances.forEach((val, key) => {
            abi.getDecimal(key,function (d) {
            })
            // tokens.push(key);
            amount.push(val)
        });
        abi.getGroupTokensEx(account.mainPKr,false,function(tokens, tokenToTokens) {
            if (tokens.length > 0) {
                abi.getDecimal(tokens[0],function (d) {
                    console.log(tokens[0],d);
                })
                abi.getDecimal(tokenToTokens.get(tokens[0])[0],function (d) { 
                })
                self.initPair(tokens[0], tokenToTokens.get(tokens[0])[0], function (pair) {  
                    self.setState({
                        tokenIn: tokens[0],
                        tokenIn2: tokens[1],
                        tokenOut: tokenToTokens.get(tokens[0])[0],
                        tokens: tokens,
                        amount: amount,
                        tokenToTokens: tokenToTokens,
                        pair: pair
                    })
                });
            }
        });
    }

    initPair(tokenB, tokenA, callback) {
        let self = this;
        abi.pairInfoWithOrders(this.state.account.mainPKr, tokenA, tokenB, function (pair) {
            callback(pair);
        })
    }
    componentDidMount() {
        this.doUpdate();
    }
    doUpdate = ()=>{
        let self = this;
        abi.init.then(() => {
                let pk = localStorage.getItem("accountPK") 
                abi.accountList(function (accounts) {
                    if (pk) {
                        for (let act of accounts) {
                            if (pk === act.pk) {
                                self.setState({account: act});
                                break;
                            }
                        }
                    } else {
                        pk = accounts[0].pk;
                        localStorage.setItem("accountPK",pk);
                        self.setState({account: accounts[0]});
                    }
                    abi.accountDetails(pk, function (account) {
                        self.setState({account: account}, function () {
                            self.init(account)
                        })
                    })
                });

            });
    }
    showRate(amountIn) {
        let self = this;
        // console.log(this.state.tokenInAmount,"tokenInAMOUNT");
        // console.log(this.state.pair&& this.state.pair,"存在");
        if(this.state.pair && amountIn>showValue(this.state.pair.reserveA,abi.getDecimalLocal(this.state.tokenOut))){
            this.setState({
                tokenInAmount: showValue(self.state.pair.reserveA,abi.getDecimalLocal(self.state.tokenOut))
            })
        }
        this.setState({
            inputStyle:amountIn
        })
        if (!amountIn || !this.state.pair || Number(amountIn) === 0) {
            this.setState({tokenInAmount: amountIn, tokenOutAmount: 0, price: 0});
            return;
        }
      

        let amountOut;
        let pair = this.state.pair;
        // console.log(pair,"pairpairpair");
        abi.getDecimal(pair.tokenA,function(decimal){
           abi.estimateSwapBuy(self.state.account.mainPKr, pair.tokenA, pair.tokenB, self.state.tokenOut, bnToHex(amountIn,decimal),function (out) {
                console.log(out,'OUT');
                
                amountOut = new BigNumber(out).dividedBy(10**18);
                let price = amountOut.dividedBy(amountIn).toFixed(6);
                self.setState({tokenInAmount: amountIn, tokenOutAmount: amountOut.toNumber(),out:out, price: price});
            });
        })
        // abi.estimateSwap(this.state.account.mainPKr, pair.tokenA, pair.tokenB, self.state.tokenIn, bnToHex(amountIn, parseInt(abi.getDecimalLocal(pair.tokenA))), function (out) {

        //     amountOut = new BigNumber(out).dividedBy(10**18)

        //     let price = amountOut.dividedBy(amountIn).toFixed(6)
        //     self.setState({tokenInAmount: amountIn, tokenOutAmount: amountOut.toNumber(), price: price});
        // });
    }
    exchange(tokenA, tokenB, amount) {
        abi.swap(this.state.account.pk, this.state.account.mainPKr, tokenA, tokenB, amount);
    }
    showAccount(account, len) {
        if (!account || !account.mainPKr) {
            return "";
        }
        if (!len) {
            len = 8;
        }
        window.localStorage.setItem("accountPK", account.pk)
        return account.name + " " + account.mainPKr.slice(0, len) + "..." + account.mainPKr.slice(-len)
    }
    showModal = (key) => {
        if (this.state.modal) {
            this.setState({
                [key]: false
            })
        } else {
            this.setState({
                [key]: true
            })
        }

    }
    renderOrders() {
        if (!this.state.pair) {
            return;
        }
        let orders;
        if (this.state.orderType == 0) {
            orders = this.state.pair.orders.sort((o1, o2) => {
                return o2.timestamp - o1.timestamp;
            });
        } else {
            orders = this.state.pair.selfOrders.sort((o1, o2) => {
                return o2.timestamp - o1.timestamp;
            });
        }

        let orderList = orders.map((order, index) => {
            let tokenIn = this.state.pair.tokenA;
            // console.log(this.state.pair.tokenA,"this.state.pair.tokenA");
            let tokenOut = this.state.pair.tokenB;
            if (order.orderType == 1) {
                tokenIn = this.state.pair.tokenB;
                tokenOut = this.state.pair.tokenA;
            }
            return (
                <List.Item key={index}>
                    <Flex style={{fontSize: '14px'}}>
                        <Flex.Item style={{flex: 3, textAlign: 'left'}}><span>
                          {dateFormat("mm-dd HH:MM", new Date(order.timestamp * 1000))}
                      </span></Flex.Item>
                        <Flex.Item style={{
                            flex: 3,
                            textAlign: 'left'
                        }}><span>{showValue(order.amountIn)} {tokenIn}</span></Flex.Item>
                        <Flex.Item style={{flex: 1, textAlign: 'center'}}><span>-</span></Flex.Item>
                        <Flex.Item style={{
                            flex: 3,
                            textAlign: 'right'
                        }}><span>{showValue(order.amountOut)} {tokenOut}</span></Flex.Item>
                    </Flex>
                </List.Item>
            )
        });
        return orderList;

    }
    numberMax(balance) {
        let num = showValue(balance, abi.getDecimalLocal(this.state.tokenIn))  
        this.setState({
            put1: num
        })
    }
    onSelect = (opt) => {
        this.setState({
            visible: false,
            selected: opt.props.value,
        });
    };
    handleVisibleChange = (visible) => {
        this.setState({
            visible,
        });
    };
    renderContent(pageText) {
        return (
            <div style={{backgroundColor: '#e9f4f8', height: '100%', textAlign: 'center'}}>

            </div>
        );
    }
    goPage = (uri) => {
        window.location.href = uri
    }
    render() {   
        let self = this;
        let options_1 = []; //可用
        let options_2 = []; //要买
        let {pairs,pair} = this.state;
        let balance = 0;
        let usable = 0;
        if (this.state.account.balances.has(this.state.tokenIn)) {
            balance = this.state.account.balances.get(this.state.tokenIn);
        } 
        if(this.state.account.balances.has(this.state.tokenOut)){
            usable = this.state.account.balances.get(this.state.tokenOut)
        }
        this.state.tokens.forEach(each => {
            options_1.push({value: each, label: each})
        });
        let tokens = this.state.tokenToTokens.get(this.state.tokenIn);
        if (tokens) {
            tokens.forEach(each => {
                options_2.push({value: each, label: each});
            });
        }
        let froms = <div className="space-between max_sero">
               
                <div className="flex modal" onClick={() => this.showModal("")}>
                    <img width="13px" className="absolute" src={ require('../images/bottom.png')} alt=''/>
                    {/* <SelectTokenTo visible={this.state.showModal} onOk={this.setSelectTokenA} onClose={this.setShowSelectTokenA} tokens={tokensA} balance={account&&account.balances}/> */}

                    <Select
                        className="select"
                        style={{height: "20px"}}
                        options={options_2}
                        onChange={(option) => {
                            this.initPair(this.state.tokenIn,option.value, function (pair) {
                                self.setState({pair: pair, tokenOut: option.value});
                                self.showRate(self.state.tokenInAmount);
                            })
                        }}/>
                </div>
                <div className="tokenOutAmount" style={{width:"100%"}}>
                        <input value={this.state.tokenInAmount} placeholder="0" onChange={(e) => {
                            this.showRate(e.target.value)
                        }} type="number" className="inputItem"/> 
                </div>     
        </div>
        let tos = <div className="flex max_sero">
            <div className="flex modal " onClick={() => this.showModal('')}>
                <img width="13px" className="absolute" src={require('../images/bottom.png')} alt=""/>
                <Select
                    options={options_1}
                    selectedOption={{value: this.state.tokenOut}}
                    onChange={(option) => {
                        let tokenOut = this.state.tokenToTokens.get(option.value)[0];
                        this.initPair(option.value, this.state.tokenOut, function (pair) {
                                self.setState({pair: pair, tokenIn: option.value,tokenOut:tokenOut});
                                self.showRate(self.state.tokenInAmount);
                        })
                    }}/>
            </div>
            <div style={{width:"100%"}}>
                <div className="tokenOutAmount" style={{width:"100%"}}>{this.state.tokenOutAmount&&this.state.tokenOutAmount>0?this.state.tokenOutAmount:''}</div>
            </div>      
        </div>
        console.log(this.state.pair,"拿到pair了吗");
        return (
            <Layout selectedTab="1" doUpdate={this.doUpdate}>
                <div style={{padding:"10px"}}>
                    <div className="header">
                        <div className="cash color text-center" style={{fontSize:"16px",letterSpacing:"3px"}}>{i18n.t("MyBuy")}</div>

                        <div className="from" style={{marginTop:"20px"}}>
                            <div className='fontSize text-right color2'>
                                <span className={pair&&this.state.tokenInAmount>0&& !this.state.tokenOutAmount?'color2':'none'}>输入数量已超!</span>&emsp;
                                {i18n.t("Referrer")}{this.state.tokenOut}:{showValue(usable, abi.getDecimalLocal(this.state.tokenOut))}
                            </div>
                           {froms }
                        </div>
                        <div className="from">
                            <div>
                                <div className='fontSize text-right color2'>{i18n.t("usable")}{this.state.tokenIn}:{showValue(balance, abi.getDecimalLocal(this.state.tokenIn))}</div>
                                {tos}
                            </div>
                        </div>

                        <div className="fontSize color">
                            {
                                this.state.tokenOutAmount? 
                                    <div>
                                        当前兑换比例:
                                    </div>
                                    :
                                    <div>
                                      当前{this.state.tokenOut}和{this.state.tokenIn}数量:{
                                            this.state.pair && 
                                            showValue(this.state.pair.reserveA,abi.getDecimalLocal(this.state.tokenOut))
                                            +"="+
                                            showValue(this.state.pair.reserveB,abi.getDecimalLocal(this.state.tokenIn))
                                        }                 
                                    </div>
                            }

                           <div style={{height:"14px"}}>
                                    {
                                        this.state.price > 0 &&
                                        <span>1{this.state.tokenOut} : {this.state.price}{this.state.tokenIn}</span>
                                     }
                            </div>
                        </div>
                        <div>
                            {this.renderOrders()}
                        </div>   
                        <div className="text-center">
                            <input type="submit" disabled={!this.state.inputStyle}  className={this.state.inputStyle>0?'inputs':'nothing'} value={i18n.t("ConfirmBuy")} onClick={() => {
                                // let amount = new BigNumber(self.state.tokenInAmount).multipliedBy(Math.pow(10, abi.getDecimalLocal(self.state.tokenIn)));
                                self.exchange(self.state.tokenIn,self.state.tokenOut , new BigNumber(self.state.out));
                                self.setState({
                                    tokenInAmount:null
                                })
                            }}/>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }
}

export default Home;