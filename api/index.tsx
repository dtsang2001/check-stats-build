import { Button, Frog, TextInput } from 'frog'
import { Box, Heading, Text, Rows, Row, Divider, Image, Columns, Column, vars } from './ui.js'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { neynar } from 'frog/middlewares'

const SITE_URL = "https://check-stats-build.vercel.app/";

export const app = new Frog({
  title: 'Check Starts Build',
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": "19d52024f5e694eedbdf857f4a7e84bd8",
      }
    }
  }
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

function Content(weeklyAllowance:string, remainingAllowance:string, masks:string, rank:string) {
  if (typeof weeklyAllowance == "undefined") {
    return <Row paddingLeft="64" height="5/7"> 
            <Columns gap="8" grow> 
              <Column width="1/7" />
              <Column width="4/7"> 
                <Heading size="20"> You have not participated in this airdrop from BUILD </Heading>
              </Column>
              <Column width="2/7" />
            </Columns>
          </Row>;
  }

  return <Row paddingLeft="64" height="5/7"> 
          <Columns gap="8" grow> 
            <Column width="1/7" />
            <Column width="4/7"> 
              <Rows gap="8" grow>
                <Row height="1/7" > <Heading size="20"> Tipping Balance </Heading> </Row>
                <Row paddingLeft="12" height="2/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Allowance: </Text> </Column>
                    <Column width="4/7"> <Text align='right' color="blue" weight="900" size="20"> { weeklyAllowance } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Remaining: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right'>{ remainingAllowance }</Text> </Column>
                  </Columns>
                </Row>
                <Divider />
                <Row height="1/7" > <Heading size="20"> Other Information </Heading> </Row>
                <Row paddingLeft="12" height="3/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Rank: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right' weight="900" size="20"> { rank } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Balance: </Text> </Column>
                    <Column width="2/7"> <Text color="blue" align='right'>{ masks }</Text> </Column>
                  </Columns>
                </Row>
              </Rows>
            </Column>
            <Column width="2/7" />
          </Columns>
        </Row>;
}

function MakeID(length:number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

app.frame('/', async (c) => {
  console.log(1);
  
  const { frameData } = c
  const { fid } = frameData || {} 

  var { displayName, username, pfpUrl } = c.var.interactor || {};

  var masksBalance = await fetch("https://app.masks.wtf/api/balance?fid="+fid ,{ method:"GET" });
  var { weeklyAllowance, remainingAllowance, masks } = JSON.parse(await masksBalance.text()) || {};

  var rankBalance = await fetch("https://app.masks.wtf/api/rank?fid="+fid ,{ method:"GET" });
  var { rank } = JSON.parse(await rankBalance.text()) || {};
  
  const ids = MakeID(7);
  const uriTip = "https://warpcast.com/dangs.eth/0x96d39fed";
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $BUILD Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dangs${ids}`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/bg.png")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={pfpUrl || ""} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof weeklyAllowance != "undefined" ? `- Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(weeklyAllowance, remainingAllowance, masks, rank) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button value="apples">My Stats</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>,
      <Button.Link href={uriTip}>💰Tip Here</Button.Link>,
    ],
  })
})

app.frame('/:fid/:secret', async (c) => {

  const { req } = c

  const regex = /\/([0-9]*)\/dangs[0-9a-zA-Z]*/gm;
  const fid = [...req.url.matchAll(regex)][0][1];
  
  var user = await fetch("https://client.warpcast.com/v2/user-by-fid?fid="+fid ,{ method:"GET" });
  var { result } = JSON.parse(await user.text()) || {};
  var { displayName, username, pfp } = result.user || {};
  var { url } = pfp || {}

  var masksBalance = await fetch("https://app.masks.wtf/api/balance?fid="+fid ,{ method:"GET" });
  var { weeklyAllowance, remainingAllowance, masks } = JSON.parse(await masksBalance.text()) || {};

  var rankBalance = await fetch("https://app.masks.wtf/api/rank?fid="+fid ,{ method:"GET" });
  var { rank } = JSON.parse(await rankBalance.text()) || {};
  
  const ids = MakeID(7);
  const uriTip = "https://warpcast.com/dangs.eth/0x96d39fed";
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $BUILD Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dangs${ids}`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/bg.png")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={url} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof weeklyAllowance != "undefined" ? `- Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(weeklyAllowance, remainingAllowance, masks, rank) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button action="/" value='/'>My Stats</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>,
      <Button.Link href={uriTip}>💰Tip Here</Button.Link>,
    ],
  })
})
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
