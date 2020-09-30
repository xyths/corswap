import * as React from 'react';
import {Modal, List} from 'antd-mobile'
import {showValue} from './utils/common'
import abi from './abi'
class SelectToken extends React.Component{
    render() {
        const {visible,onOk,tokens,balance,onClose} = this.props; 
        console.log(tokens,"tokensss")
        return (
           
            <div>
                <Modal visible={visible}
                       popup
                       animationType="slide-up"
                       closable={true}
                       onClose={()=>onClose(false)}
                >
                    <List renderHeader={() => <div>选择币种</div>} className="popup-list">
                        {tokens.map((token, index) => (
                            <List.Item key={index} extra={balance&&balance.has(token)?showValue(balance.get(token),abi.getDecimalLocal(token)?abi.getDecimalLocal(token):18,3):"0.000"} onClick={()=>{
                                onOk(token)
                            }}>{token}</List.Item>
                        ))}
                    </List>
                </Modal>
            </div>
        );
    }
}

export default SelectToken