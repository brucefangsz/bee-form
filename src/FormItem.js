import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import InputGroup from 'bee-input-group';
import Label from 'bee-label';
import { RegExp } from 'core-js/library/web/timers';
const regs = {
    email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    tel: /^1[3|4|5|7|8]\d{9}$/,
    IDCard: /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,//身份证
    chinese: /^[\u4e00-\u9fa5]+?$/,//中文校验
    password: /^[0-9a-zA-Z,.!?`~#$%^&*()-=_+<>'"\[\]\{\}\\\|]{6,15}$/,//6-15位数字英文符号
};
const propTypes = {
    clsPrefix:PropTypes.string,
    className:PropTypes.string,
    isRequire:PropTypes.bool,//是否必填
    errorMessage:PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.array
    ]),//错误信息
    htmlType:PropTypes.oneOf(['email','tel','IDCard','chinese','password',null]),//htmlType有值的时候 reg不生效
    reg:PropTypes.oneOfType([
        PropTypes.instanceOf(RegExp),
        PropTypes.array
    ]),//校验正则,可传字符串或者数组，如果是数组，需要和errorMessage数组一一对应
    method:PropTypes.oneOf(['change','blur',null]),//校验方式
    blur:PropTypes.func,//失去焦点的回调,参数为value
    change:PropTypes.func,//值改变的回调,参数为value当地售后地址
    check:PropTypes.func,//验证的回调
    checkItem:PropTypes.func,
    useRow:PropTypes.func,
    inline:PropTypes.bool,//formItem是否行内
    labelName:PropTypes.node,//label标签文字或dom
    labelClassName:PropTypes.string,//label样式名
    inputBefore:PropTypes.node,//input之前的
    inputAfter:PropTypes.node,//input之后的
    inputBeforeSimple:PropTypes.node,//input之前的(参考输入框组的inputGroup.Button，和inputBefore不能同时使用)
    inputAfterSimple:PropTypes.node,//input之后的(参考输入框组的inputGroup.Button，和inputAfter不能同时使用)
    mesClassName:PropTypes.string,//提示信息样式名
    checkInitialValue:PropTypes.bool,//是否校验初始值，未开放 ...col.propTypes
    showMast:PropTypes.bool,//是否显示必填项的 *
    asyncCheck:PropTypes.func,//自定义校验，返回true则校验成功，false或无返回值则校验失败。参数为{name:xxx,value:xxx}
    xs:PropTypes.number,//xs显示列数
    sm:PropTypes.number,//sm显示列数
    md:PropTypes.number,//md显示列数
    lg: PropTypes.number,//lg显示列数
    xsOffset: PropTypes.number,//xs偏移列数
    smOffset: PropTypes.number,//sm偏移列数
    mdOffset: PropTypes.number,//md偏移列数
    lgOffset: PropTypes.number,//lg偏移列数
    xsPush: PropTypes.number,//xs右偏移列数
    smPush: PropTypes.number,//sm右偏移列数
    mdPush: PropTypes.number,//md右偏移列数
    lgPush: PropTypes.number,//lg右偏移列数
    xsPull: PropTypes.number,//xs左偏移列数
    smPull: PropTypes.number,//sm左偏移列数`
    mdPull: PropTypes.number,//md左偏移列数
    lgPull: PropTypes.number,//lg左偏移列数
    labelXs:PropTypes.number,
    labelSm:PropTypes.number,
    labelMd:PropTypes.number,
    labelLg: PropTypes.number,
    labelXsOffset: PropTypes.number,
    labelSmOffset: PropTypes.number,
    labelMdOffset: PropTypes.number,
    labelLgOffset: PropTypes.number,
    labelXsPush: PropTypes.number,
    labelSmPush: PropTypes.number,
    labelMdPush: PropTypes.number,
    labelLgPush: PropTypes.number,
    labelXsPull: PropTypes.number,
    labelSmPull: PropTypes.number,
    labelMdPull: PropTypes.number,
    labelLgPull: PropTypes.number,
};
const defaultProps = {
    clsPrefix:'u-form',
    isRequire:false,//是否必填
    errorMessage:'校验失败',//错误信息
    reg:/[/w/W]*/,
    method:'change',
    blur:()=>{},
    change:()=>{},
    isFormItem:true,
    check:()=>{},
    checkItem:()=>{},
    inline:false,
    labelName:'',
    labelClassName:'',
    inputBefore:'',
    inputAfter:'',
    mesClassName:'',
    checkInitialValue:false,
    useRow:false,
    showMast:false,
};
class FormItem extends Component {
    constructor(props){
        super(props);
        this.state={
            hasError:false,
            value:this.props.children.props.value||'',
            width:0,
            maxWidth:'100%',
            errorMessage:typeof props.errorMessage=='string'?props.errorMessage:props.errorMessage[0]
        }
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.checkNow&&(!this.props.checkNow)){
            this.checkSelf();
        }
    }
    componentDidMount(){
        if(this.props.inline){
            let outerWidth=ReactDOM.findDOMNode(this.refs.outer)?(ReactDOM.findDOMNode(this.refs.outer).clientWidth||ReactDOM.findDOMNode(this.refs.outer).offsetWidth):0;
            let width=ReactDOM.findDOMNode(this.refs.label)?(ReactDOM.findDOMNode(this.refs.label).clientWidth||ReactDOM.findDOMNode(this.refs.label).offsetWidth):0;
            this.setState({
                width,
                maxWidth:outerWidth?outerWidth-width-10:'100%'
            })
        }
    }
    handleBlur=()=>{
        let value=ReactDOM.findDOMNode(this.input).value;
        let name=ReactDOM.findDOMNode(this.input).name;
        if(this.props.method==='blur') {
            let flag=this.itemCheck(value,name);
            this.setState({
                hasError: !flag
            });
            this.props.checkItem(
                {
                    "name": name,
                    "verify": flag,
                    "value":value
                }
            );
        }
        this.props.blur(value);
        this.props.children.props.onBlur&&this.props.children.props.onBlur(value);
    }
    handleChange=(selectV)=>{
        let value=selectV;
        let name=ReactDOM.findDOMNode(this.input).name||this.input.props.name;
        this.setState({
            value:value
        });
        if(this.props.method==='change') {
            let flag=this.itemCheck(value,name);
            this.setState({
                hasError: !flag
            });
            this.props.checkItem(
                {
                    "name": name,
                    "verify": flag,
                    "value":value
                }
            );
        }
        this.props.change(value);
        this.props.children.props.onChange&&this.props.children.props.onChange(value);
    }
    /**
     * 校验方法
     * @param value
     * @returns {boolean}
     */
    itemCheck=(value,name)=>{
        let {isRequire,htmlType,check,asyncCheck,errorMessage}=this.props;
        let reg=htmlType?regs[htmlType]:this.props.reg;
        let obj={
            "name":name,
            "value":value===undefined?'':value
        };
        if(typeof asyncCheck=='function'){
            let flag=!!asyncCheck(obj);
            obj.verify=flag;
            check(flag,obj);
            return flag;
        }else{
            if(reg.length){
                let flag=true;
                for(let i=0;i<reg.length;i++){
                    if(!reg[i].test(value)){
                        this.setState({
                            errorMessage:errorMessage[i]
                        });
                        flag=false;
                        break;
                    }
                }
                obj.verify=flag;
                if(isRequire){
                    if(value){
                        check(flag,obj);
                        return flag;
                    }else{
                        check(false,obj);
                        return false;
                    }
                }else{
                    check(true,obj);
                    return true;
                }
            }else{
                let flag=reg.test(value);
                obj.verify=flag;
                if(isRequire){
                    if(value){
                        check(flag,obj);
                        return flag;
                    }else{
                        check(false,obj);
                        return false;
                    }
                }else{
                    check(true,obj);
                    return true;
                }
            }
            
        }
    }
    /**
     * 触发校验
     */
    checkSelf=()=>{
        //this.input.props.defaultValue select
        //this.input.props.selectedValue radio
        //this.input.props.value datapick
        let value=ReactDOM.findDOMNode(this.input).value||this.state.value||this.input.domValue||(this.input.props&&this.input.props.defaultValue)||(this.input.props&&this.input.props.selectedValue)||(this.input.props&&this.input.props.value);
        if(this.input.props&&this.input.props.defaultChecked!=undefined){//checkbox
            value=!!this.state.value;
        }
        let name=ReactDOM.findDOMNode(this.input).name||this.input.props.name;
        let flag=this.itemCheck(value,name);
        this.props.checkItem(
            {
                "name": name,
                "verify": flag,
                "value":value
            },true
        );
        this.setState({
            hasError:!flag
        })
    }
    render() {
        const {showMast,useRow,children,inline,className,clsPrefix,inputBefore,inputAfter,inputBeforeSimple,inputAfterSimple,mesClassName,labelName,labelClassName}=this.props;
        let clsObj={};
        clsObj[`${clsPrefix}-item`]=true;
        className?clsObj[className]=true:'';
        let clsErrObj={};
        clsErrObj[`${clsPrefix}-error`]=true;
        if(inline){
            clsObj[`${clsPrefix}-inline`]=true;
            clsErrObj[`${clsPrefix}-error-inline`]=true;
        }
        mesClassName?clsErrObj[mesClassName]=true:'';
        if(this.state.hasError)clsErrObj['show']=true;
        let childs=[];
        React.Children.map(this.props.children,(child,index)=>{
            if(child.props.type==='text'||child.props.type==='password'){
                childs.push(
                    <div ref="outer" key={index}>
                        {
                            useRow?'':<Label ref="label" className={labelClassName?labelClassName:''} >
                                {showMast?(<span className="u-mast">*</span>):''}
                                {labelName}
                                </Label>
                        }
                        <span className="u-input-group-outer"  style={{'maxWidth':this.state.maxWidth}}>
                            <InputGroup key={index} simple={!!(inputBeforeSimple||inputAfterSimple)}>
                            {inputBefore?<InputGroup.Addon>{inputBefore}</InputGroup.Addon>:''}
                            {inputBeforeSimple?<InputGroup.Button>{inputBeforeSimple}</InputGroup.Button>:''}
                                {
                                    React.cloneElement(children, {
                                        onBlur: this.handleBlur,
                                        onChange: this.handleChange,
                                        ref: (e) => {
                                            this.input = e
                                        },
                                        value:this.state.value
                                    })
                                }
                                {inputAfterSimple?<InputGroup.Button>{inputAfterSimple}</InputGroup.Button>:''}
                                {inputAfter?<InputGroup.Addon>{inputAfter}</InputGroup.Addon>:''}
                           </InputGroup>
                        </span>

                    </div>
                )
            }else{
                childs.push(
                    <div ref="outer" key={index}>
                        {
                            useRow?'':<Label ref="label" className={labelClassName?labelClassName:''} >
                                {showMast?(<span className="u-mast">*</span>):''}
                                {labelName}</Label>
                        }
                        <span className="u-input-group-outer"  style={{'maxWidth':this.state.maxWidth}}>
                            <InputGroup >
                            {inputBefore?<InputGroup.Addon>{inputBefore}</InputGroup.Addon>:''}
                                {
                                    React.cloneElement(children, {
                                        key:{index},
                                        onBlur: this.handleBlur,
                                        onChange: this.handleChange,
                                        ref: (e) => {
                                            this.input = e
                                        }
                                    })
                                }
                                {inputAfter?<InputGroup.Addon>{inputAfter}</InputGroup.Addon>:''}
                        </InputGroup>
                        </span>
                    </div>
                );
            }
        });
        return (
            <div className={classnames(clsObj)}>
                {childs}
                <div className={classnames(clsErrObj)} style={{'marginLeft':this.state.width}}>
                    {this.state.errorMessage}
                </div>
            </div> )
    }
};
FormItem.propTypes = propTypes;
FormItem.defaultProps = defaultProps;
export default FormItem;