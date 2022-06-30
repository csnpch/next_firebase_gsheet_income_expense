import Link from 'next/link';

const WhoAreU = () => {
    return (
        <div className='
            grid grid-rows-[1fr_1fr_2.8rem_2.8rem] justify-items-center items-center w-full h-screen text-white
        '>
            <Link href='/push?who=dad'>
                <div className='text-4xl cardWhoAreU bg-indigo-600 hover:bg-indigo-700 hover:text-5xl'>
                พ่อ
                </div>
            </Link>
            <Link href='/push?who=mom'>
                <div className='text-4xl cardWhoAreU bg-pink-700 hover:bg-pink-800 hover:text-5xl'>
                แม่
                </div>
            </Link>
            <Link href='/push?who=other'>
                <div className='text-lg cardWhoAreU bg-purple-800 hover:bg-purple-900 hover:text-xl'>
                อื่น ๆ
                </div>
            </Link>
            <Link href='/history'>
                <div className='cardWhoAreU bg-gray-800/90 hover:bg-gray-800  hover:text-lg'>
                    ดูประวัติ / สรุป
                </div>
            </Link>
        </div>
    )
}
  
export default WhoAreU;