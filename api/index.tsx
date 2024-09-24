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
        "x-airstack-hubs": "153980d6f165b43839efc9e3f24dc9973",
      }
    }
  }
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

function Content(build_score:number, build_budget:number, rank:string, tokens_committed_round_1:string, talent_builder_score:string) {
  if (typeof build_score == "undefined") {
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
                    <Column alignVertical='bottom' width="3/7"> <Text>- Budget: </Text> </Column>
                    <Column width="4/7"> <Text align='right' color="blue" weight="900" size="20"> { build_budget } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- BUILD Points: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right'>{ build_score }</Text> </Column>
                  </Columns>
                </Row>
                <Divider />
                <Row height="1/7" > <Heading size="20"> Other Information </Heading> </Row>
                <Row paddingLeft="12" height="3/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Builder Score: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right' weight="900" size="20"> { talent_builder_score } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Build Committed: </Text> </Column>
                    <Column width="2/7"> <Text color="blue" align='right'>{ tokens_committed_round_1 }</Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Rank: </Text> </Column>
                    <Column width="2/7"> <Text color="blue" align='right'>{ rank }</Text> </Column>
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

  var { displayName, username, pfpUrl, verifiedAddresses } = c.var.interactor || {};
  var { ethAddresses } = verifiedAddresses || {}

  if (typeof ethAddresses != 'undefined') {
    var buildStarts = await fetch("https://build.top/api/stats?wallet="+ethAddresses ,{ method:"GET" });
    var { build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score } = JSON.parse(await buildStarts.text()) || {};  

    build_budget = parseInt(build_budget || 0);
    build_score = parseInt(build_score || 0);
  } else {
    var { build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score } = verifiedAddresses || {};
  }

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
                <Image width="72" height="100%" borderRadius="192" objectFit='cover' src={pfpUrl || ""} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof rank != "undefined" ? `- Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score) }
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

  var verifications = await fetch("https://client.warpcast.com/v2/verifications?fid="+fid+"&limit=15" ,{ method:"GET" });
  var { result } = JSON.parse(await verifications.text()) || {};
  var ethAddresses = result.verifications[0].address || "";

  if (typeof ethAddresses != 'undefined') {
    var buildStarts = await fetch("https://build.top/api/stats?wallet="+ethAddresses ,{ method:"GET" });
    var { build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score } = JSON.parse(await buildStarts.text()) || {};  

    build_budget = parseInt(build_budget || 0);
    build_score = parseInt(build_score || 0);
  } else {
    var { build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score } = result || {};
  }

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
                <Image width="72" height="100%" borderRadius="192" objectFit='cover' src={url} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof rank != "undefined" ? `- Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(build_score, build_budget, rank, tokens_committed_round_1, talent_builder_score) }
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
