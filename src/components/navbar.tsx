import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'

//- Components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Navbar = () => {

    const [pathRightNavigator, setPathRightNavigator] = useState<object>({path: '/history', 'name': 'ดูประวัติ'})
    const router = useRouter();
    
    useEffect(() => {
        if (router.pathname === '/history') {
            setPathRightNavigator({path: '/', 'name': 'ย้อนกลับ'})
        }
    }, [])

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Link href='/'>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}
                            className='font-normal text-lg'
                            >
                            <p className='cursor-pointer w-fit transform hover:scale-105 duration-100'>
                                รายรับ - รายจ่าย
                            </p> 
                        </Typography>
                    </Link>
                    <Link href={pathRightNavigator.path}>
                        <Button color="inherit">{pathRightNavigator.name}</Button>
                    </Link>
                </Toolbar>
            </AppBar>
        </div>
    )
  }
  
  export default Navbar;