import pool from '@/lib/db'
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid'

export async function POST(request: Request) {

    const body = await request.json();
    const { url } = body;

    let code: string = '';

    try {

        const result  = await pool.query(
            'SELECT * FROM urls WHERE original_url = $1',
            [url]
        );

        if ( result.rowCount == 0 ) { 
            // register the url

            const generateHash = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 3);
            let unique: boolean = false;
            while ( !unique ) {

                code = generateHash();
                const check = await pool.query(
                    'SELECT 1 FROM urls WHERE short_code = $1',
                    [code]
                );

                unique = check.rowCount==0;

            }
            // break out of while means code generated is indeed unique

            await pool.query(
                'INSERT INTO urls (short_code, original_url, count) VALUES ($1, $2, $3)',
                [code, url, 1]
            );
            
            return NextResponse.json({ success: true, code });

        } else {
            return NextResponse.json({ code: result.rows[0].short_code })
        }
    } catch (error) {
        return NextResponse.json({ error: "db failed."})
    }
    

}