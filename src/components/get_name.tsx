import react, { useState, useEffect } from 'react';

//- Components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface typeValue {
    getName: (name: string) => void
}

const PopupGetName: React.FC<typeValue> = ({ getName }) => {

    const [name, setName] = useState<string>('');

    const onSubmit = (): void => {
        getName(name);
    }

    useEffect(() => {
        setName(localStorage.getItem('name') || '');
    }, [])


    return (
        <div className='flex w-full h-screen justify-center items-center'>
            <div className='relative p-6 z-20 rounded-lg bg-white w-10/12 md:w-5/12'>
                <TextField 
                    label="โปรดระบุชื่อของคุณ" 
                    variant="standard" 
                    className='w-full'
                    value={name}
                    onChange={(e) => { setName(e.target.value); }}
                />
                <Button 
                    variant="outlined"
                    className='mt-4 h-[36px] text-[1.020rem] w-full border-blue-600'
                    onClick={onSubmit}
                >
                        บันทึก
                </Button>
            </div>

            <div className='overlay'></div>
        </div>
    )
}
  
export default PopupGetName;