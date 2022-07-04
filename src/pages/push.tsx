import type { NextPage } from 'next';
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';

//- API
import axios from 'axios';
import axiosConfig from './../utils/axios/config';

//- Database
import db from '../utils/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import ObjectID from 'bson-objectid';

// import Link from 'next/link';
import Swal from 'sweetalert2';

//- Components
import Navbar from '../components/navbar';
import PopupGetName from '../components/get_name';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AiOutlineSave, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { BiAddToQueue } from 'react-icons/bi'
import { FcCancel } from 'react-icons/fc';


const Push: NextPage = () => {

    const Swal = require('sweetalert2');

    const router = useRouter();
    const { who } = router.query;
    const [statusGetName, setStatusGetName] = useState<boolean>(false);
    const [statusOnInsert, setStatusOnInsert] = useState<boolean>(true);
    const [statusOnEdit, setStatusOnEdit] = useState<boolean>(false);
    const [statusIncome, setStatusInCome] = useState<boolean>(false);
    const [statusExpenses, setStatusExpenses] = useState<boolean>(false);

    const [itemType, setItemType] = useState<number>(0);
    const [itemName, setItemName] = useState<string>('');
    const [itemAmount, setItemAmount] = useState<number>();
    const [listItem, setListItem] = useState<object>([]);
    
    const classBtnTypeActive = 'bg-blue-600 text-white';
    const [btnTypeActiveStatus, setActiveStatusType] = useState<boolean>(false);

    const getNameForNoti = (): string => {
        return 'คุณ' + (who === 'dad' ? 'พ่อ' : (who === 'mom' ? 'แม่' : (localStorage.getItem('name') + ' - บุคคลอื่น' || 'อื่น ๆ ไร้นาม')))
    }

    useEffect(() => {

        checkStatusIncomeAndExpenses();

    }, [listItem, statusOnInsert, statusOnEdit])

    useEffect(() => {

        if (who === 'other') {
            setStatusGetName(true);
        }

        (async () => {

            var listId: any = [];
            const collection_transaction: any = collection(db, 'transaction');
            const docsObj: any = await getDocs(collection_transaction);
            var docs: any = docsObj.docs.map((doc: any) => {
                listId.push(doc.id);
                return doc.data();
            });
            
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

            docs = docs.filter((item: any) => (checkDate(item.created_at) && item.who === who));
            setListItem(docs);

            if (docs.length > 0) {
                setStatusOnInsert(false);
            }
            
        })();

    }, []);


    const getCurrencyFormat = (val: any): string => {
        return (val).toLocaleString('th-TH');
    }


    const resetStatusIncomeAndExpenses = async () => {
        setStatusInCome(false);
        setStatusExpenses(false);
    }


    const checkTypeIncomeAndExpenses = async () => {
        listItem.map((item: any) => {
            if (item.type === 0) {
                setStatusExpenses(true);
            } else if (item.type === 1) {
                setStatusInCome(true);
            }
        });
    }

    
    const checkStatusIncomeAndExpenses = async (docs: any = null): void => {

        if (!docs) {
            docs = listItem;
        }

        await resetStatusIncomeAndExpenses();
        await checkTypeIncomeAndExpenses();

    }


    const checkDate = (created_at: string): boolean => {
        
        let now = new Date();
        let date = new Date(created_at);
        
        return (now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear());
    }
    

    const getName = (name: string): void => {
        if (name !== '' && name.length > 2) {
            localStorage.setItem('name', name);
            setStatusGetName(false);
        }
    }

    const clearForm = (): void => {
        setItemName('');
        setItemAmount('');
        setStatusOnInsert(false);
    }

    
    const onInsert = async (): void => {
        
        if (!statusOnInsert) {
            setStatusOnInsert(true);
        } else if (itemName != '' && parseFloat(itemAmount) > 0) {
            
            if (statusOnInsert) {

                let objId = ObjectID().toString();

                let getWhoTH = (who === 'dad' ? 'พ่อ' : who === 'mom' && 'แม่'); 

                let transaction = {
                    who: who || null,
                    whoName: ((who === 'dad' || who === 'mom') ? getWhoTH : localStorage.getItem('name') || 'other'),
                    name: itemName,
                    type: itemType,
                    amount: itemAmount,
                    created_at: new Date().toISOString()
                }
                
                await setDoc(doc(db, 'transaction', objId), transaction).then(() => {
                    // success
                    if (listItem.length === 0) {
                        axios.post(`${axiosConfig.baseUrl.backend}/line/notify`,{
                            message: `\n\n${getNameForNoti()} : ได้เริ่มทำการ\nบันทึกรายรับรายจ่าย\n**สำหรับวันนี้แล้ว !!`,
                            access_token: `Bw2gGNlG9n3IyxhG2k7zpfsuLbnXCGjj01rap4exgsn`
                        })
                        .catch(err => {
                            Swal.fire({
                                title: 'เกิดข้อผิดพลาด',
                                text: 'โปรดลองใหม่อีกครั้ง',
                                icon: 'error',
                                confirmButtonText: 'เข้าใจแล้ว'
                            });
                        });
                    }

                }).catch(() => {
                    Swal.fire({
                        title: 'ไม่สามารถบันทึกข้อมูลได้',
                        text: 'กรุณาลองใหม่อีกครั้ง',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                })

                
                setListItem([...listItem, {
                    objId: objId,
                    who: transaction.who,
                    whoName: transaction.whoName,
                    name: transaction.name,
                    type: itemType,
                    amount: transaction.amount,
                    created_at: transaction.created_at
                }]);

            }
                
            if (!statusOnEdit) {
                clearForm();
            } else {
                setStatusOnEdit(false);
            }
            setStatusOnInsert(false);
            clearForm();
            
        } else {
            Swal.fire({
                title: 'ไม่สามารถทำรายการได้',
                html: 'ข้อมูลไม่ถูกต้อง <br>โปรดตรวจสอบ และทำรายการอีกครั้ง',
                icon: 'info',
                customClass: {
                    title: 'text-xl',
                },
                confirmButtonText: 'เข้าใจแล้ว'
            })
        }

        
    }

    const onEdit = (item: object): void => {
        
        setItemName(item.name);
        setItemAmount(item.amount);
        setStatusOnEdit(true);
        setStatusOnInsert(true);

        onDelete(item);
        setListItem(listItem.filter((val: any) => val.objId != item.objId));
    }

    const onDelete = async (item: object): void => {
        setListItem(listItem.filter((val: any) => val.objId != item.objId));
        await deleteDoc(doc(db, 'transaction', item.objId));

        if (listItem.length === 1) {
            setStatusOnInsert(true);
        }
    }


    const onCancel = (): void => {
        if (statusOnEdit) {
            setStatusOnEdit(false);
        }
        setStatusOnInsert(false);
    }


    return (
        <div className='feadIn h-screen overflow-x-hidden w-full'>
            { 
                statusGetName && 
                <PopupGetName getName={(item) => getName(item)} /> 
            }
                        
            {
                !statusGetName && 
                <Navbar />
            }

            {
                !statusGetName && 
                <div className='flex-center flex-col w-full'>

                    
                    {
                        (who === 'other') &&
                        <div className='mt-8 md:mt-20 -mb-4 text-xl flex flex-row'>
                            บันทึกโดย : <p className='text-blue-900 ml-2'>" {localStorage.getItem('name') || 'other'} "</p>
                        </div>
                    }
                    
                    {
                        listItem.length > 0 &&
                        <div className='w-full h-full mt-10'>
                            <p className='text-center w-full text-lg'>ประวัติรายรับ - รายจ่าย</p>
                            <div className='containListItems items-end gap-x-4 md:gap-x-6 grid-cols-[8px_2fr_62px_52px] mt-6 -mb-2'>
                                <p className='text-sm lg:text-base '>#</p>
                                <p className='text-sm lg:text-base w-full text-left'>รายการวันนี้</p>
                                <p className='text-sm lg:text-base w-full text-right'>จำนวนเงิน</p>
                                <p className='text-sm lg:text-base '>จัดการ</p>
                            </div>
                            {
                                statusIncome &&
                                <div className='containListItems items-end gap-x-4 md:gap-x-6 grid-cols-[8px_2fr_62px_52px] -mb-2'>
                                    <p className='col-span-4 text-green-700 text-lg md:-ml-4'>รายรับ</p>
                                </div>
                            }
                            {listItem.map((item, index) => {
                                if (item.type === 1) {
                                    return (
                                        <div key={index} className='containListItems gap-x-4 md:gap-x-6 grid-cols-[8px_2fr_1fr_52px] bg-gray-50 border-b rounded-md'>
                                            <p>{index + 1}</p>
                                            <p className='px-1 text-left overflow-x-auto overflow-y-hidden max-w-[100%]'>
                                                {(item.who === 'other' ? item.name + ' : ' + item.whoName : item.name)}
                                            </p>
                                            <p className='w-full text-right'>{getCurrencyFormat(item.amount)}</p>
                                            <div className='flex-center gap-x-2 md:gap-x-2.5 md:text-xl'>
                                                <AiOutlineEdit className='text-orange-500 cursor-pointer hover:text-orange-600'
                                                    onClick={() => onEdit(item)}
                                                />
                                                <AiOutlineDelete className='text-red-500 cursor-pointer hover:text-red-600' 
                                                    onClick={() => onDelete(item)}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                            {   
                                statusExpenses &&
                                <div className='containListItems items-end gap-x-4 md:gap-x-6 grid-cols-[8px_2fr_62px_52px] mt-2 -mb-2'>
                                    <p className='col-span-4 text-red-700 text-lg md:-ml-4'>รายจ่าย</p>
                                </div>
                            }
                            {
                                listItem.map((item, index) => {
                                    if (item.type === 0) {
                                        return (
                                            <div key={index} className='containListItems gap-x-4 md:gap-x-6 grid-cols-[8px_2fr_1fr_52px] bg-gray-50 border-b rounded-md'>
                                                <p>{index + 1}</p>
                                                <p className='px-1 text-left overflow-x-auto overflow-y-hidden max-w-[100%]'>
                                                    {(item.who === 'other' ? item.name + ' : ' + item.whoName : item.name)}
                                                </p>
                                                <p className='w-full text-right'>{getCurrencyFormat(item.amount)}</p>
                                                <div className='flex-center gap-x-2 md:gap-x-2.5 md:text-xl'>
                                                    <AiOutlineEdit className='text-orange-500 cursor-pointer hover:text-orange-600'
                                                        onClick={() => onEdit(item)}
                                                    />
                                                    <AiOutlineDelete className='text-red-500 cursor-pointer hover:text-red-600' 
                                                        onClick={() => onDelete(item)}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                    }


                    {
                        statusOnInsert 
                        ?
                        <div id="insertForm" className={`${listItem.length == 0 ? 'mt-16 md:mt-24' : 'mt-16'} w-full flex flex-col items-center mb-16`}>
                            
                            <div className={`
                                -mt-6 mb-6 w-10/12 xl:w-2/12 h-[2.5px] bg-black rounded-full opacity-60 shadow-md 
                                transition-all duration-1000
                                ${!btnTypeActiveStatus ? 'bg-red-600' : 'bg-green-600'}`}
                            ></div>
                            
                            <p>เลือกรายการที่ต้องการเพิ่ม</p>
                            <Stack spacing={1} direction="row" className='p-6'>
                                {/* <Button variant="contained" className='py-8 px-20 text-lg'>รายรับ</Button>
                                <Button variant="contained" className='py-8 px-20 text-lg'>รายจ่าย</Button> */}
                                <Button 
                                    variant="outlined" 
                                    className={`btnSelectType md:text-lg px-8 py-1 ${!btnTypeActiveStatus && classBtnTypeActive}`}
                                    onClick={() => {
                                        setActiveStatusType(false);
                                        setItemType(0);
                                    }}
                                >
                                    รายจ่าย
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    className={`btnSelectType md:text-lg px-8 py-1 ${btnTypeActiveStatus && classBtnTypeActive}`}
                                    onClick={() => {
                                        setActiveStatusType(true);
                                        setItemType(1);
                                    }}
                                >
                                    รายรับ
                                </Button>
                            </Stack>
                            
                            <div className='w-full flex-center flex-col gap-y-2 md:mt-2'>
                                <TextField className='w-9/12 xl:w-2/12' label="ชื่อรายการ" variant="standard" 
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                                <TextField className='w-9/12 xl:w-2/12' label="จำนวนเงิน" variant="standard" 
                                    value={itemAmount} type={'number'}
                                    onChange={(e) => setItemAmount(parseFloat(e.target.value) < 0 ? 0 : parseFloat(e.target.value))}
                                />
                                <div className='flex-center gap-x-2 mt-4'>
                                    {
                                        !statusOnEdit &&
                                        <Button className='w-full' variant="outlined" color='error' startIcon={<FcCancel />}
                                            onClick={onCancel}
                                        >
                                            ยกเลิก
                                        </Button>
                                    }
                                    <Button className='w-full' variant="contained" startIcon={<AiOutlineSave />}
                                            onClick={onInsert}
                                        >
                                            บันทึก
                                    </Button>
                                </div>
                            </div>

                        </div>
                        :
                        <div className='w-full flex-center flex-col'>
                            <Button className='w-8/12 md:w-4/12 text-xs md:text-sm py-2 mt-6 md:mt-6' variant="contained" startIcon={<BiAddToQueue />}
                                onClick={onInsert}
                            >
                                เพิ่มรายการอีก
                            </Button>
                            <p className='mt-6 text-blue-700 font-thin text-sm tracking-wider text-center w-11/12 mx-auto'>
                                หากไม่มีอะไรเพิ่มแล้ว <br />สามารถกดออกได้เลย <br />ระบบทำการบันทึกรายการ<br />ที่ทำไว้ให้โดยอัตโนมัติ
                            </p>
                        </div>
                    }

                    

                </div>
            }

            <div className="space mb-20"></div>

        </div>
    )
}

export default Push;
