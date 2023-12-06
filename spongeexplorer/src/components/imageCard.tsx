import Link from 'next/link'
import Image from 'next/image'


export default function ImageCard() {
    const Sponge={
        Category:'',
        Name:'Perifora',
        Image:{
            src:'',
            alt:''
        }
    }
    return (
    <Link href={`/Pages/Sponges/${Sponge.Category}/${Sponge.Name}`}>
       <Image src={Sponge.Image.src} alt={Sponge.Image.alt} />
       <h1>${Sponge.Name}</h1>
    </Link>
      )
  }