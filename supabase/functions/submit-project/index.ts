import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {"Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") || "https://neroqi111111.github.io", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS", "Vary":"Origin"};
const json=(status:number, body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async (req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return json(405,{success:false,error:"Method not allowed"});
  const origin=req.headers.get("origin"); const allowed=Deno.env.get("SITE_ORIGIN")||"https://neroqi111111.github.io";
  if(origin && origin!==allowed) return json(403,{success:false,error:"Origin not allowed"});
  try {
    const body=await req.json();
    // Honeypot: silently accept bots without storing their data.
    if(typeof body.website==="string" && body.website.trim()) return json(200,{success:true,reference_code:"received"});
    const name=typeof body.name==="string"?body.name.trim():"";
    const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
    const phone=typeof body.phone==="string"?body.phone.trim():"";
    const contact=body.preferred_contact==="whatsapp"?"whatsapp":"email";
    const packageName=typeof body.package_name==="string"?body.package_name.trim():"";
    const details=typeof body.details==="string"?body.details.trim():"";
    if(name.length<1||name.length>100) return json(400,{success:false,error:"Enter a name between 1 and 100 characters."});
    if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400,{success:false,error:"Enter a valid email address."});
    if(phone.length>30||packageName.length<1||packageName.length>100||details.length<15||details.length>4000||body.consent!==true) return json(400,{success:false,error:"Check the required fields and privacy consent."});
    const url=Deno.env.get("SUPABASE_URL"); const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url||!key) return json(500,{success:false,error:"Request service is not configured."});
    const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const reference="ETG-"+crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase();
    const {error}=await db.from("project_requests").insert({reference_code:reference,customer_name:name,email,phone:phone||null,preferred_contact:contact,package_name:packageName,project_details:details,launch_discount:body.launch_discount===true,consent:true,status:"new"});
    if(error){console.error("request insert failed",error.message);return json(500,{success:false,error:"Could not save your request. Please try again or email us."});}
    // Optional notification. Request storage succeeds even if email delivery fails.
    const resendKey=Deno.env.get("RESEND_API_KEY"); const notifyTo=Deno.env.get("NOTIFY_EMAIL");
    if(resendKey&&notifyTo){try{const mail=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resendKey,"Content-Type":"application/json"},body:JSON.stringify({from:Deno.env.get("NOTIFY_FROM")||"Eltayar Requests <onboarding@resend.dev>",to:[notifyTo],subject:`New project request ${reference}`,text:`Reference: ${reference}
Name: ${name}
Email: ${email}
Phone: ${phone||"—"}
Preferred contact: ${contact}
Package: ${packageName}
Launch discount requested: ${body.launch_discount===true?"Yes":"No"}

Details:
${details}`})});if(!mail.ok)console.error("notification delivery failed",mail.status);}catch(e){console.error("notification error",String(e));}}
    return json(200,{success:true,reference_code:reference});
  } catch(e){console.error("bad request",String(e));return json(400,{success:false,error:"Invalid request payload."});}
});
