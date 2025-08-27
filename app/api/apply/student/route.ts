import prisma from "@/lib/prisma";
import { StudentProfile, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (type === "profile") {
        // Handle profile registration
        const formData = await req.formData();

        const name = formData.get("fullName");
        const gender = formData.get("gender");
        const age = formData.get("age");
        const dateOfBirth = formData.get("dateOfBirth");
        const phoneNumber = formData.get("phone-number");
        const address = formData.get("address");
        const guardianName = formData.get("guardian-name");
        const guardianNumber = formData.get("guardian-number");
        const previousEducation = formData.get("previous-course");

        const studentProfile : StudentProfile = await prisma.studentProfile.create({
            data: {
                fullName: name as string,
                gender: gender as string,
                age: age as number,
                dateOfBirth: dateOfBirth as string,
                phoneNumber: phoneNumber as string,
                address: address as string,
                guardianName: guardianName as string,
                guardianNumber: guardianNumber as string,
                previousEducation: previousEducation as string,
                user: {
                    connect: {
                        id: formData.get("userId"),
                    }
                }
            }
        });

        if (!studentProfile) {
            return NextResponse.json({message: "User creation failed"}, {status: 500});
        }

        return NextResponse.json({message: "Profile created successfully", studentProfile}, {status: 201});


    } else if (type === "account") {

        const formData = await req.formData();
        
        const userName = formData.get("username");
         const email = formData.get("email");
        const password = formData.get("password");
        

        const user : User = await prisma.user.create({
            data: {
                email,
                password: await bcrypt.hash(password, 10),
                name: userName,
            }
        });

        if (!user) {
            return NextResponse.json({message: "User creation failed"}, {status: 500});
        }

        return NextResponse.json({message: "Account created successfully", user}, {status: 201});
    }

}