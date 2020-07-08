import styled from 'styled-components'
import { mediaQuery } from './MediaQuery';

/* 
   Date   : 2020-05-18 15:07:21
   Author : Arhua Ho
   Content: 作為Flex外層容器組件使用
*/
export const Container = styled.div.attrs((props) => ({}))`
    //Flex設置
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    flex-direction: ${props => props?.theme?.direction ?? 'initial'}; //控制子組件排列方向: row、row-reverse、column、column-reverse
    justify-content: ${props => props?.theme?.justify ?? 'initial'};  //控制子組件在水平方向上的對齊: flex-start、center、flex-end、space-between、space-around、space-evenly
    align-items: ${props => props?.theme?.alignItems ?? 'initial'};   //控制子組件在垂直方向上的對齊: flex-start、center、flex-end、stretch、baseline
    
    //定位
    position: ${props => props?.theme?.position ?? 'relative'};       //控制position屬性: static、relative、fixed、absolute、sticky、inherit、initial
    top: ${props => props?.theme?.top ?? 'initial'};
    right: ${props => props?.theme?.right ?? 'initial'};
    bottom: ${props => props?.theme?.bottom ?? 'initial'};
    left: ${props => props?.theme?.left ?? 'initial'};
    z-index: ${props => props?.theme?.zIndex ?? 'initial'};

    //寬高
    height: ${props => props?.theme?.height ?? 'initial'};
    min-width: ${props => props?.theme?.minWidth ?? '0'};//修復滾動條 x 方向

    //外距、邊框、內距
    margin: ${props => props?.theme?.margin ?? 'initial'};
    border: ${props => props?.theme?.border ?? 'initial'};
    border-bottom: ${props => props?.theme?.borderBottom};
    border-radius: ${props => props?.theme?.borderRadius ?? 'initial'};
    padding: ${props => props?.theme?.padding ?? 'initial'};

    //溢出
    overflow-y: ${props => props?.theme?.overflowY ?? 'initial'};
    overflow-x: ${props => props?.theme?.overflowX ?? 'initial'};

    //滾動條美化
    ::-webkit-scrollbar {
        width: 0.5em;
        height: ${props => props?.theme?.scrollHeight ?? 'initial'}; //scroll-x 的高度
        }
    ::-webkit-scrollbar-track {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        margin:0px 0.1rem 5px 0;
        }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollUnhoverBackgroundColor ?? '#9093994d'};
        }
    &:hover::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollHoverBackgroundColor ?? '#9093994d'};
        }

    //陰影
    box-shadow: ${props => props?.theme?.boxShadow ?? 'initial'};

    //背景
    background-attachment: ${props => props?.theme?.attachment ?? 'initial'}; 
    background-color: ${props => props?.theme?.backgroundColor ?? 'initial'};
    background-image: ${props => 'url(' + props?.theme?.img + ')' ?? 'initial'};
    background-position: ${props => props?.theme?.backgroundPosition ?? 'initial'};
    background-position-y: ${props => props?.theme?.positiony ?? 'initial'};
    background-position-x: ${props => props?.theme?.positionx ?? 'initial'};
    background-repeat: ${props => props?.theme?.backgroundRepeat ?? 'initial'};
    background-size: ${props => props?.theme?.backgroundSize ?? 'initial'};

    //游標
    cursor: ${props => props?.theme?.cursor ?? 'initial'}; 

    //轉場
    transition: ${props => props?.theme?.transition ?? 'initial'}; 

    //動畫

`

/* 
   Date   : 2020-05-18 15:07:21
   Author : Arhua Ho
   Content: 作為Flex次層容器組件使用，
            選用斷點:
                none
*/
export const SubContainer = styled.div.attrs((props) => ({}))`

    //Flex設置
    flex-grow: 0;
    max-width: ${props => props?.theme?.occupy ? props.theme.occupy * 100 / 12 + '%' : props?.theme?.occupy ?? 'initial'};                  
    flex-basis: ${props => props?.theme?.occupy ? props.theme.occupy * 100 / 12 + '%' : props?.theme?.occupy ?? 'initial'};
    box-sizing: border-box;

    //定位
    position: ${props => props?.theme?.position ?? 'relative'};       //控制position屬性: static、relative、fixed、absolute、sticky、inherit、initial
    top: ${props => props?.theme?.top ?? 'initial'};
    right: ${props => props?.theme?.right ?? 'initial'};
    bottom: ${props => props?.theme?.bottom ?? 'initial'};
    left: ${props => props?.theme?.left ?? 'initial'};
    z-index: ${props => props?.theme?.zIndex ?? 'initial'};

    //寬高
    width: ${props => props?.theme?.width ?? 'initial'}; 
    min-width: ${props => props?.theme?.minWidth ?? '0'};//修復滾動條 x 方向
    height: ${props => props?.theme?.height ?? 'initial'}; 
    line-height: ${props => props?.theme?.lineHeight ?? 'initial'};

    //外距、邊框、內距
    margin: ${props => props?.theme?.margin ?? 'initial'};
    border: ${props => props?.theme?.border ?? 'initial'};
    border-radius: ${props => props?.theme?.borderRadius ?? 'initial'};
    border-top: ${props => props?.theme?.borderTop ?? 'initial'};
    padding: ${props => props?.theme?.padding ?? 'initial'};

    //溢出
    overflow-y: ${props => props?.theme?.overflowY ?? 'initial'};
    overflow-x: ${props => props?.theme?.overflowX ?? 'initial'};

    //滾動條美化
    ::-webkit-scrollbar {
        width: 0.5em;
        height: ${props => props?.theme?.scrollHeight ?? 'initial'}; //scroll-x 的高度
        }
    ::-webkit-scrollbar-track {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        margin:0px 0.1rem 5px 0;
        }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollUnhoverBackgroundColor ?? '#9093994d'};
        }
    &:hover::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollHoverBackgroundColor ?? '#9093994d'};
        }

    //陰影
    box-shadow: ${props => props?.theme?.boxShadow ?? 'initial'};

    //背景
    background-attachment: ${props => props?.theme?.backgroundAttachment ?? 'initial'}; 
    background-color: ${props => props?.theme?.backgroundColor ?? 'initial'};
    background-image: ${props => 'url(' + props?.theme?.img + ')' ?? 'initial'};
    background-position: ${props => props?.theme?.backgroundPosition ?? 'initial'};
    background-position-y: ${props => props?.theme?.positiony ?? 'initial'};
    background-position-x: ${props => props?.theme?.positionx ?? 'initial'};
    background-repeat: ${props => props?.theme?.backgroundRepeat ?? 'initial'};
    background-size: ${props => props?.theme?.backgroundSize ?? 'initial'};
    
    //游標
    cursor: ${props => props?.theme?.cursor ?? 'initial'}; 

    //轉場
    transition: ${props => props?.theme?.transition ?? 'initial'}; 

    //動畫

    //字體
    white-space : ${props => props?.theme?.whiteSpace ?? 'initial'};
    text-align: ${props => props?.theme?.textAlign ?? 'initial'}; 
    font-size: ${props => props?.theme?.fontSize ?? 'initial'}; 
    color: ${props => props?.theme?.color ?? 'initial'}; 
`

/* 
   Date   : 2020-05-18 15:07:21
   Author : Arhua Ho
   Content: 作為未帶Flex容器組件使用，
            選用斷點:
                none
*/
export const BasicContainer = styled.div.attrs((props) => ({}))`

    box-sizing: border-box;
    display: ${props => props?.theme?.display};
    flex: ${props => props?.theme?.flex};

    //定位
    position: ${props => props?.theme?.position ?? 'relative'};       //控制position屬性: static、relative、fixed、absolute、sticky、inherit、initial
    top: ${props => props?.theme?.top ?? 'initial'};
    right: ${props => props?.theme?.right ?? 'initial'};
    bottom: ${props => props?.theme?.bottom ?? 'initial'};
    left: ${props => props?.theme?.left ?? 'initial'};
    z-index: ${props => props?.theme?.zIndex ?? 'initial'};

    //寬高
    width: ${props => props?.theme?.width ?? 'initial'}; 
    min-width: ${props => props?.theme?.minWidth ?? '0'};//修復滾動條 x 方向
    height: ${props => props?.theme?.height ?? 'initial'}; 
    max-height: ${props => props?.theme?.maxHeight};
    line-height: ${props => props?.theme?.lineHeight ?? 'initial'};

    //外距、邊框、內距
    margin: ${props => props?.theme?.margin ?? 'initial'};
    border: ${props => props?.theme?.border ?? 'initial'};
    border-radius: ${props => props?.theme?.borderRadius ?? 'initial'};
    border-top: ${props => props?.theme?.borderTop};
    border-left: ${props => props?.theme?.borderLeft};
    border-right: ${props => props?.theme?.borderRight};
    border-bottom: ${props => props?.theme?.borderBottom};
    padding: ${props => props?.theme?.padding ?? 'initial'};

    //溢出
    overflow-y: ${props => props?.theme?.overflowY ?? 'initial'};
    overflow-x: ${props => props?.theme?.overflowX ?? 'initial'};

    //滾動條美化
    ::-webkit-scrollbar {
        width: 0.5em;
        height: ${props => props?.theme?.scrollHeight ?? 'initial'}; //scroll-x 的高度
        }
    ::-webkit-scrollbar-track {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        margin:0px 0.1rem 5px 0;
        }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollUnhoverBackgroundColor ?? '#9093994d'};
        }
    &:hover::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: ${props => props?.theme?.scrollHoverBackgroundColor ?? '#9093994d'};
        }

    //陰影
    box-shadow: ${props => props?.theme?.boxShadow ?? 'initial'};

    //背景
    background-attachment: ${props => props?.theme?.backgroundAttachment ?? 'initial'}; 
    background-color: ${props => props?.theme?.backgroundColor ?? 'initial'};
    background-image: ${props => 'url(' + props?.theme?.img + ')' ?? 'initial'};
    background-position: ${props => props?.theme?.backgroundPosition ?? 'initial'};
    background-position-y: ${props => props?.theme?.positiony ?? 'initial'};
    background-position-x: ${props => props?.theme?.positionx ?? 'initial'};
    background-repeat: ${props => props?.theme?.backgroundRepeat ?? 'initial'};
    background-size: ${props => props?.theme?.backgroundSize ?? 'initial'};
    
    //游標
    cursor: ${props => props?.theme?.cursor ?? 'initial'}; 

    //轉場
    transition: ${props => props?.theme?.transition ?? 'initial'}; 

    //動畫

    //字體
    white-space : ${props => props?.theme?.whiteSpace ?? 'initial'};
    text-align: ${props => props?.theme?.textAlign ?? 'initial'}; 
    font-size: ${props => props?.theme?.fontSize ?? 'initial'}; 
    color: ${props => props?.theme?.color ?? 'initial'}; 

    &:hover {
        background-color: ${props => props?.theme?.hoverBackgroundColor};
    }
`