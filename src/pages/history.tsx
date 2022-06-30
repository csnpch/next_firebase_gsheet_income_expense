import type { NextPage } from 'next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../utils/firebase/config';

//- Components MUI
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

//- Components
import Navbar from '../components/navbar';

const History: NextPage = () => {

    const [listItem, setListItem] = useState<any>([]);
    const [listItemAll, setListItemAll] = useState<any>([]);
    const [listItemOfDate, setListItemOfDate] = useState<any>([]);
    const [monthNow, setMonthNow] = useState<number>(new Date().getMonth() + 1);
    const [totalExpense, setTotalExpense] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    
    const [statusDataIsReady, setStatusDataIsReady] = useState<boolean>(false);
    const [listMonth, setListMonth] = useState<any>([
        { name: 'January', number: 1 },
        { name: 'February', number: 2 },
        { name: 'March', number: 3 },
        { name: 'April', number: 4 },
        { name: 'May', number: 5 },
        { name: 'June', number: 6 },
        { name: 'July', number: 7 },
        { name: 'August', number: 8 },
        { name: 'September', number: 9 },
        { name: 'October', number: 10 },
        { name: 'November', number: 11 },
        { name: 'December', number: 12 },
    ]);

    const makeListItemFromDocs = async (listId: any, docs: any) => {

        docs = docs.map((item: any, index: any) => {
            return {
                objId: listId[index],
                who: item.who,
                whoName: item.whoName || 'other',
                name: item.name,
                type: item.type,
                amount: item.amount,
                created_at: item.created_at
            }
        })
        setListItem(docs);

    }


    const genarateDate = async () => {
        
        let listDate: any = [];
        let tmp_listItemOfDate: any = [];
        

        listItem.forEach((item: any) => {
            let day = new Date(item.created_at).getDate();
            let month = new Date(item.created_at).getMonth() + 1;
            let year = new Date(item.created_at).getFullYear();
            
            if(!listDate.some((itemDate: any) => itemDate.day === day && itemDate.month === month && itemDate.year === year)) {
                listDate.push({
                    day,
                    month,
                    year
                });
            }

        });
        console.log('listDate', listDate)

        listDate.reverse();
        listDate.forEach((date: any) => {
            
            let itemToDate: any = {
                date: `${date.day}/${date.month}/${date.year}`,
                income: [],
                expense: [],
                totalIncome: 0,
                totalExpense: 0
            }

            listItem.forEach((item: any) => {
                let day = new Date(item.created_at).getDate();
                let month = new Date(item.created_at).getMonth() + 1;
                let year = new Date(item.created_at).getFullYear();

                if(day === date.day && month === date.month && year === date.year) {
                    if(item.type === 1) {
                        itemToDate.income.push(item);
                        itemToDate.totalIncome += item.amount;
                    } else if(item.type === 0) {
                        itemToDate.expense.push(item);
                        itemToDate.totalExpense += item.amount;
                    }
                }

            });

            tmp_listItemOfDate.push(itemToDate);

        });

        // filter listItemOfDate by month
        let tmp_listItemInMonth: any = [];
        let tmpTotalIncomeInMonth: number = 0;
        let tmpTotalExpenseInMonth: number = 0;
        tmp_listItemOfDate.forEach((item: any) => {
            if(parseInt(item.date.split('/')[1]) === monthNow) {
                tmp_listItemInMonth.push(item);
                tmpTotalIncomeInMonth += item.totalIncome;
                tmpTotalExpenseInMonth += item.totalExpense;
            }
        });

        setTotalIncome(tmpTotalIncomeInMonth);
        setTotalExpense(tmpTotalExpenseInMonth);

        setListItemOfDate(() => tmp_listItemInMonth);
        setListItemAll(() => tmp_listItemOfDate);
        setStatusDataIsReady(true);
    }

    const filterDataToMonth = (month: number) => {

        let tmpTotalIncomeInMonth: number = 0;
        let tmpTotalExpenseInMonth: number = 0;
        
        let tmp_listItemInMonth: any = [];
        listItemAll.forEach((item: any) => {
            if(parseInt(item.date.split('/')[1]) === month) {
                tmp_listItemInMonth.push(item);
                tmpTotalIncomeInMonth += item.totalIncome;
                tmpTotalExpenseInMonth += item.totalExpense;
            }
        });

        setTotalIncome(tmpTotalIncomeInMonth);
        setTotalExpense(tmpTotalExpenseInMonth);

        setListItemOfDate(() => tmp_listItemInMonth);
    }

    const changeMonth = (e: SelectChangeEvent) => {
        setMonthNow(parseInt(e.target.value));
        filterDataToMonth(parseInt(e.target.value));
    }


    const getTime = (date: any) => {
        let hour: any = new Date(date).getHours();
        let minute: any = new Date(date).getMinutes();

        // add zero before minute and hour
        if(hour < 10) {
            hour = `0${hour}`;
        }
        if(minute < 10) {
            minute = `0${minute}`;
        }


        return `${hour}:${minute}`;
    }

    const getCurrency = (amount: number) => {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').split('.')[0];
    }


    useEffect(() => {
        
        (async () => {

            var listId: any = [];
            const collection_transaction: any = collection(db, 'transaction');
            const docsObj: any = await getDocs(collection_transaction);
            var docs: any = docsObj.docs.map((doc: any) => {
                listId.push(doc.id);
                return doc.data();
            });
            
            await makeListItemFromDocs(listId, docs);
            await genarateDate();

        })();

    }, [statusDataIsReady])


    return (
        <div className='feadIn h-screen overflow-x-hidden'>
            <Navbar />
            <div className='flex-center flex-col w-full h-full'>
                {
                    statusDataIsReady 
                    ?
                    <div className='w-11/12 lg:w-6/12 h-full'>

                        <p className='text-center w-full text-lg mt-16'>ประวัติรายรับ - รายจ่าย ปี {new Date().getFullYear()}</p>
                        
                        <div className='flex-center flex-col lg:flex-row'>
                            <FormControl fullWidth className='mt-10'>
                                <InputLabel id="demo-simple-select-label">เลือกเดือนที่ต้องการดูสรุป</InputLabel>
                                <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={monthNow.toString()}
                                label="เลือกเดือนที่ต้องการดูสรุป"
                                onChange={changeMonth}
                                >
                                {
                                    listMonth.map((item: any, index: any) => {
                                        return <MenuItem value={item.number}
                                        key={index}>{item.name}</MenuItem>
                                    })
                                }
                                </Select>
                            </FormControl>

                            <div className='w-[86%] lg:w-11/12 mt-2 lg:mt-10 p-4 flex flex-col items-end -ml-4 mb-4'>
                                <div className='grid grid-cols-[188px_1fr] grid-rows-3 gap-y-2 text-sm lg:text-base'>
                                    <p>รายรับทั้งหมดในเดือนนี้ </p>
                                    <p className='text-blue-800 w-full text-right '>{getCurrency(totalIncome)}</p>
                                    <p>รายจ่ายทั้งหมดในเดือนนี้ </p>
                                    <p className='text-red-800 w-full text-right '>{getCurrency(totalExpense)}</p>
                                    <p>คงเหลือในเดือนนี้ </p>
                                    <p className='w-full text-right'>{getCurrency(totalIncome - totalExpense)}</p>
                                </div>
                            </div>
                        </div>

                        {   
                            listItemOfDate.length !== 0 ? 
                            listItemOfDate.map((itemListDate: any, indexDate: number) => {
                                return (
                                    <div key={indexDate} className='borderCardReport bg-gray-50 p-4 rounded-md mb-10 border-2 border-red-400'>
                                        <p className='col-start-1 col-span-3 ml-1 mt-1 mb-4'>{itemListDate.date}</p>
                                        <div className='items-center mt-2 w-full bg-gray-200/50 shadow-sm rounded-lg lg:rounded-l-lg p-1 lg:p-2 grid grid-cols-[1fr_50px_52px_40px] lg:grid-cols-[40px_1fr_80px_52px_40px] gap-x-4 lg:gap-x-12'>
                                            <p className='hidden lg:block text-sm lg:text-base text-center w-full'>ลำดับ</p>
                                            <p className='text-sm lg:text-base text-left w-full'>รายการ</p>
                                            <p className='text-sm lg:text-base text-right w-full flex flex-row'>จำนวน<span className='hidden lg:block'>เงิน</span></p>
                                            <p className='text-sm lg:text-base text-center w-full'>โดย</p>
                                            <p className='text-sm lg:text-base text-center w-full'>เวลา</p>
                                        </div>
                                        <div className='w-full py-4 flex flex-col gap-y-2'>
                                            {
                                                itemListDate.income.length > 0 &&
                                                <p className='w-full mt-1 mb-1 text-blue-800 text-sm underline'>รายรับ</p>
                                            }
                                            {itemListDate.income.map((item: any, index: number) => {
                                                return (
                                                    <div key={index} className='w-full grid grid-cols-[1fr_50px_52px_40px] lg:grid-cols-[40px_1fr_80px_52px_40px] gap-x-4 lg:gap-x-12 gap-y-2'>
                                                        <p className='hidden lg:block text-sm lg:text-base text-center'>{index + 1}.</p>
                                                        <p className='ml-1 text-sm lg:text-base text-left'>{item.name}</p>
                                                        <p className={`ml-1 text-sm lg:text-base text-right ${item.type === 1 && 'text-green-800'}`}>
                                                            {getCurrency(item.amount)}
                                                        </p>
                                                        <p className='ml-1 text-sm lg:text-base text-center'>{item.who === 'dad' ? 'พ่อ' : item.who === 'mom' ? 'แม่' : item.whoName }</p>
                                                        <p className='ml-1 text-sm lg:text-base text-right'>{getTime(item.created_at)}</p>
                                                    </div>
                                                )
                                            })}
                                            {
                                                itemListDate.expense.length > 0 &&
                                                <div className='w-full mt-2 mb-1'>
                                                    <div className='w-full h-[1px] bg-black/20 mb-3.5'></div>
                                                    <p className='w-full text-red-800 text-sm underline'>รายจ่าย</p>
                                                </div>
                                            }
                                            {itemListDate.expense.map((item: any, index: number) => {
                                                return (
                                                    <div key={index} className='w-full grid grid-cols-[1fr_50px_52px_40px] lg:grid-cols-[40px_1fr_80px_52px_40px] gap-x-4 lg:gap-x-12 gap-y-2'>
                                                    <p className='hidden lg:block text-sm lg:text-base text-center'>{index + 1}.</p>
                                                    <p className='ml-1 text-sm lg:text-base text-left'>{item.name}</p>
                                                    <p className={`ml-1 text-sm lg:text-base text-right ${item.type === 0 && 'text-red-800'}`}>
                                                        {getCurrency(item.amount)}
                                                    </p>
                                                    <p className='ml-1 text-sm lg:text-base text-center'>{item.who === 'dad' ? 'พ่อ' : item.who === 'mom' ? 'แม่' : item.whoName }</p>
                                                    <p className='ml-1 text-sm lg:text-base text-right'>{getTime(item.created_at)}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className='w-full text-sm'>
                                            <div className='flex flex-col justify-center items-end mt-2 gap-y-2 gap-x-4'>
                                                <div className='w-full h-[1px] bg-black/20 mb-2'></div>
                                                <p className='text-xs'>สรุปรายวันโดยรวมของครอบครัว</p>
                                                <div className='grid grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-y-1.5 justify-end items-end justify-items-end'>
                                                    <div className='row-start-1 lg:col-start-3 text-blue-800'>
                                                        <span>รายรับทั้งหมด : </span>
                                                        <span>{getCurrency(itemListDate.totalIncome)} บ.</span>
                                                    </div>
                                                    <div className='row-start-2 lg:col-start-3 text-red-800'>
                                                        <span>รายจ่ายทั้งหมด : </span>
                                                        <span>{getCurrency(itemListDate.totalExpense)} บ.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                            :
                            <p className='w-full text-center mt-6 lg:mt-10 text-red-800 text-sm lg:text-base'>ไม่พบรายการในเดือนนี้</p>
                        }
                        <div className='space h-20'></div>
                    </div>
                    :
                    <p className='text-center w-full text-sm absolute top-40'>- ยังไม่มีรายการ -</p>
                }

            </div>

        </div>
    )

}

export default History;
