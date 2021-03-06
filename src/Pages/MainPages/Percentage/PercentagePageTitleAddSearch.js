import React, { useContext, useState } from 'react';
import { Context } from '../../../Store/store'
import { SubContainer, Container, BasicContainer } from '../../../Components/Containers';
import { PageTitle } from '../../../Components/PageTitle';
import { EasyButton } from '../../../Components/Buttons';
import AddIcon from '@material-ui/icons/Add';
import { SearchTextInput, FormControl, FormRow, FormCardSelector } from '../../../Components/Forms';
import { useForm, useSelector } from '../../../SelfHooks/useForm'
import { Text } from '../../../Components/Texts';
import { DatePicker } from '../../../Components/DatePicker';
import styled from 'styled-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const PercentagePageTitleAddSearchBase = (props) => {

    const { Theme } = useContext(Context);
    const { pages: { percentagePage: { percentagePageTitleAddSearch } } } = Theme;
    const [IsExpand, setIsExpand] = useState(false);
    const [ChoosenTag, setChoosenTag] = useState(1);

    const [SearchWord, SearchWordhandler, SearchWordregExpResult] = useForm("", [""], [""]);
    const [Mode, Modehandler, ModeregExpResult, ModeResetValue] = useSelector([], [], []); // 狀態欄位
    const [SearchDate, SearchDatehandler, SearchDateregExpResult, SearchDateeResetValue] = useForm([new Date(), new Date()], [""], [""]);


    if (!props.tableBasicContainerLessThan768) {
        return (
            <>
                <FormControl theme={{}} onSubmit={(e) => {
                    e.preventDefault();
                    //console.log("dsfdf")
                    props.execute(1, SearchDate, SearchWord);
                    props.execute2(1, SearchDate, SearchWord);
                    props.execute3(1, SearchDate, SearchWord);
                }}>
                    <Container theme={{ justify: "space-between", padding: "40px 0 29px 40px", }}>
                        {/* 標題 */}
                        <SubContainer>
                            <Text theme={{
                                display: "inline-block",
                                fontSize: "1.75em",
                                fontWeight: 600,
                                color: "#444",
                                userSelect: "none"
                            }}>預約率總覽</Text>
                        </SubContainer>
                        {/* 日期區間選單、搜尋輸入框 */}
                        <SubContainer theme={{ padding: "0 2.5rem 0 0" }}>
                            <FormRow theme={percentagePageTitleAddSearch.addAndSearchFormRow}>
                                <SubContainer theme={percentagePageTitleAddSearch.addButtonSubContainer}>
                                    <DatePicker value={props.searchDate} getDate={props.searchDateeResetValue}
                                        doThings={(date) => { props.execute(1, date, SearchWord); props.execute2(1, date, SearchWord); props.execute3(1, date, SearchWord); SearchDateeResetValue(date) }}></DatePicker>
                                </SubContainer>
                                <SearchTextInput
                                    value={SearchWord}
                                    onChange={SearchWordhandler}
                                    regExpResult={SearchWordregExpResult}
                                    placeholder={"請輸入搜尋內容"}
                                    theme={percentagePageTitleAddSearch.searchInput}
                                    searchOnClick={() => { props.execute(1, SearchDate, SearchWord); props.execute2(1, SearchDate, SearchWord); props.execute3(1, SearchDate, SearchWord); }}
                                />
                            </FormRow>
                        </SubContainer>
                    </Container>
                    <BasicContainer theme={{ margin: '0 3rem 0 40px', }}>
                        <FormRow theme={{ justify: "flex-start", borderBottom: "1px solid #964f19" }}>
                            <SubContainer theme={{ padding: "0 0.75rem 0 0" }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(1);
                                    }}
                                    theme={percentagePageTitleAddSearch.tagButton(props.tag === 1)}
                                    text={"門市預約率"}
                                />
                            </SubContainer>
                            <SubContainer theme={{ padding: "0 0.75rem 0 0" }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(2);
                                    }}
                                    theme={percentagePageTitleAddSearch.tagButton(props.tag === 2)}
                                    text={"區域預約率"}
                                />
                            </SubContainer>
                            <SubContainer theme={{ padding: "0 0rem 0 0" }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(3);
                                    }}
                                    theme={percentagePageTitleAddSearch.tagButton(props.tag === 3)}
                                    text={"足健師預約率"}
                                />
                            </SubContainer>
                        </FormRow>
                    </BasicContainer>
                </FormControl >
            </>
        )
    }
    else {
        return (
            <>
                <BasicContainer className={props.className} theme={{ padding: "0 0 0 0.5rem" }} >
                    <FormControl theme={{ padding: "0px 0 29px 0px" }} onSubmit={(e) => {
                        e.preventDefault();
                        //console.log("dsfdf")
                        props.execute(1, SearchDate, SearchWord);
                        props.execute2(1, SearchDate, SearchWord);
                        props.execute3(1, SearchDate, SearchWord);
                    }}>

                        <FormRow theme={{ justify: "center", padding: "0px 0 0px 0px", }}>

                            <SubContainer theme={{ occupy: 4 }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(1);
                                    }}
                                    theme={percentagePageTitleAddSearch.smTagButton(props.tag === 1)}
                                    text={"門市預約率"}
                                />
                            </SubContainer>
                            <SubContainer theme={{ occupy: 4 }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(2);
                                    }}
                                    theme={percentagePageTitleAddSearch.smTagButton(props.tag === 2)}
                                    text={"區域預約率"}
                                />
                            </SubContainer>
                            <SubContainer theme={{ occupy: 4 }}>
                                <EasyButton
                                    onClick={() => {
                                        // props.setOpenAddJumpDialog(true) 
                                        props.setTag(3);
                                    }}
                                    theme={percentagePageTitleAddSearch.smTagButton(props.tag === 3)}
                                    text={"足健師預約率"}
                                />
                            </SubContainer>
                        </FormRow>
                        <FormRow theme={{ justify: "flex-start", padding: "0px 0 0px 0px", }}>
                            <BasicContainer onClick={() => { setIsExpand(e => !e) }} theme={{ cursor: "pointer" }}>
                                <ExpandMoreIcon style={{
                                    width: "1rem",
                                    position: "relative",
                                    top: "0.5rem",
                                    color: "#999",
                                    cursor: "pointer"
                                }}></ExpandMoreIcon>
                                <Text theme={{ display: "inline-block", margin: "0 0 0.75rem 0", color: "#999", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", userSelect: "none" }}>篩選日期區間或其它條件</Text>
                            </BasicContainer>
                        </FormRow>
                        {/* 日期區間選單、搜尋輸入框 */}
                        {IsExpand && <FormRow>
                            <SubContainer theme={percentagePageTitleAddSearch.addButtonSubContainerLessThan768}>
                                <DatePicker theme={{ width: "100%" }} value={props.searchDate} getDate={props.searchDateeResetValue}
                                    doThings={(date) => { props.execute(1, date, SearchWord); props.execute2(1, date, SearchWord); props.execute3(1, date, SearchWord); SearchDateeResetValue(date) }}></DatePicker>
                            </SubContainer>
                            <SearchTextInput
                                value={SearchWord}
                                onChange={SearchWordhandler}
                                regExpResult={SearchWordregExpResult}
                                placeholder={"請輸入搜尋內容"}
                                theme={percentagePageTitleAddSearch.searchInputLessThan768}
                                searchOnClick={() => { props.execute(1, SearchDate, SearchWord); props.execute2(1, SearchDate, SearchWord); props.execute3(1, SearchDate, SearchWord); }}
                            />
                        </FormRow>}


                    </FormControl >
                </BasicContainer>
            </>
        )
    }
}

export const PercentagePageTitleAddSearch = styled(PercentagePageTitleAddSearchBase).attrs((props) => ({}))`
`