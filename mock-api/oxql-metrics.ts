/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { OxqlQueryResult } from '~/api'
import type {
  OxqlMetricName,
  OxqlVcpuState,
} from '~/pages/project/instances/instance/tabs/MetricsTab/OxqlMetric'

import { instances } from './instance'
import type { Json } from './json-type'

const oneHourAgo = new Date()
oneHourAgo.setHours(oneHourAgo.getHours() - 1)
const now = new Date()
const timestamps: string[] = []
// Generate timestamps for the last hour
for (let i = oneHourAgo.getTime(); i < now.getTime(); i += 60000) {
  timestamps.push(new Date(i).toISOString())
}

type ValueType = { [key in OxqlMetricName]: number[] }

const mockOxqlValues: ValueType = {
  'instance_network_interface:bytes_received': [
    19589220.623748355, 24553203.242848497, 89094997.39982976, 88911367.62801822,
    89564328.13052855, 36132222.97561263, 35083093.4423788, 45992685.125303574,
    52667932.85079793, 53255578.251586914, 50642139.72662767, 53016799.10056307,
    53453471.83148456, 17812773.001480814, 17652089.511599142, 17400992.998094894,
    23783344.52673782, 87510120.57284649, 88415586.70307633, 89809422.42279987,
    36294110.18462029, 35816494.883518465, 50898547.59673651, 52888621.42617168,
    52022765.40817507, 51545607.28884054, 50940589.28290987, 45175697.87988242,
    18574000.425671637, 18727470.05461767, 19270084.616364624, 19699874.56110518,
    89088859.22025315, 88411150.33482315, 88127023.98263156, 42293581.61247408,
    38734001.65471564, 49297923.93599405, 51553782.50758036, 51244054.148059346,
    51728001.475473344, 51534232.55254867, 51047390.06649641, 10061318.072499434,
    9044264.254223755, 9134684.412748203, 9050554.118707722, 9035379.9069059,
    9110098.444441319, 9041842.197785899, 9035280.981180245, 9020950.700432273,
    8977950.29915887, 27381863.86000137, 89824944.62147991, 88766745.59432606,
    79294879.24604356, 16279008.5071202, 16297706.567097535, 14187828.016217524,
  ],
  'instance_network_interface:bytes_sent': [
    61967407.4690769, 62659750.37321169, 94615638.21567552, 94830488.5349947,
    95073373.66159962, 114515161.09650381, 114513480.4104714, 67598551.7442919,
    60878378.37459309, 61284428.313176505, 58812438.49990403, 61108040.21864518,
    61438901.75645653, 61604633.377452575, 65329473.79495335, 64454685.17365676,
    66649624.01594997, 93106698.60171998, 94118093.74878043, 95640017.17327368,
    127418480.32586104, 125125303.39594136, 60007588.507188044, 60696339.00900922,
    59533389.07721457, 59727164.03291828, 59385691.85417155, 56385978.939908296,
    58482326.04577281, 58931768.40465623, 60684771.505763024, 57382770.31131127,
    95175199.9700111, 94054057.74380775, 93627971.79398167, 114539414.03000657,
    122141655.90741396, 65057155.0238452, 59508603.56693583, 58810729.534921914,
    60332025.83279615, 59443444.112106115, 61066382.357687324, 889838412.7357846,
    919649082.456614, 927770089.9058081, 916228327.514903, 917966272.0036994,
    920090782.1096474, 917910750.6941862, 920093111.3043944, 916360373.2879275,
    913486103.4169887, 701279770.7176225, 94828852.77350871, 94669806.35246424,
    264210805.15261075, 1652357411.4296043, 1652078679.222105, 1441081863.6751692,
  ],
  'instance_network_interface:errors_received': [],
  'instance_network_interface:errors_sent': [],
  'instance_network_interface:packets_dropped': [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  'instance_network_interface:packets_received': [
    51626.338736467435, 56229.94338102455, 128282.11254611396, 128564.80636165978,
    128989.41383010168, 94510.81161989772, 93665.31941652698, 81383.75535723146,
    85221.6209098, 85822.6271386839, 81979.71993495703, 85474.23160386541,
    85925.16400885995, 47190.750325350964, 48573.93626348796, 47820.90911392931,
    54921.4389477908, 126219.29470494478, 127521.29665159812, 129587.02976700662,
    96154.70608651743, 94899.91699370155, 83202.28709218279, 85022.07185646542,
    83143.82839526674, 83634.04637295769, 82936.67722227327, 75158.50165989484,
    46606.838817035314, 46982.238183297195, 48419.786227343524, 47103.65158021678,
    128437.39090478497, 127591.93090182958, 127012.8207799399, 96573.31083839823,
    97082.5916684147, 83120.52587402581, 83263.52753849649, 82238.52685222514,
    84450.35016762071, 83067.65700170219, 82959.56398332072, 43759.59507033672,
    42923.47803011315, 43431.627985928084, 43069.7969693797, 43059.457017705565,
    43602.54319799071, 42897.2872618157, 42942.59379466726, 43066.817156663514,
    42566.8082280084, 61438.10807642717, 128724.06662712415, 128398.5929964637,
    119640.40559043291, 77724.4463363611, 77964.54792540593, 67988.15593674716,
  ],
  'instance_network_interface:packets_sent': [
    52137.86783412454, 60154.82944915184, 170294.14156959817, 170629.15143145437,
    171299.78746072564, 95653.37095286128, 94097.58449760282, 99751.44401011993,
    110115.72250064427, 111057.99080788075, 106270.53166977571, 110597.50442558025,
    111123.32382798912, 48025.948755741374, 48572.51133205648, 47830.51582947457,
    58746.02990920361, 167518.38571626123, 169424.45152829404, 172155.99300919194,
    97316.28791466833, 96245.79297178097, 107429.92883606884, 109784.39976567338,
    107553.39026304561, 108101.21920026942, 107437.55840575877, 95608.73106548574,
    46657.90593104405, 46993.78703923178, 48436.42161541242, 48224.26619269178,
    170430.61313726509, 169333.80006289986, 168692.38480195502, 100688.99025787185,
    96994.62254120565, 104651.51085988498, 107656.18505288263, 106218.07389709905,
    109280.36747812887, 107509.04304010724, 108436.27060103651, 599505.2441023788,
    617622.3592543039, 623021.7338257399, 615594.7135637688, 616645.60095252,
    618255.2460245651, 616543.6810593881, 617902.5773599739, 615661.570085495,
    613548.5849304599, 495794.7258951948, 171019.15081407645, 170315.39920711354,
    270113.18497460126, 1109817.5984217522, 1109609.9278124508, 967843.945139089,
  ],
  // Current bytes_read and reads aren't super helpful; find a better one
  'virtual_disk:bytes_read': [
    134668408.94260278, 134114600.98348178, 134708158.30609903, 134746207.08323193,
    134757768.45246968, 135554970.52717522, 134400831.89327943, 134491792.51736572,
    134338108.90250394, 135251533.05339137, 134282853.1940323, 134601751.89569664,
    134120627.28247309, 135038025.54527146, 134611932.4494742, 135500486.29084927,
    134875807.5854877, 134621603.81059673, 134738692.42169353, 134534877.9584674,
    134424164.3767796, 134465893.49951467, 134757304.5764649, 135374966.46820828,
    134186580.68346651, 134756565.30676734, 135074451.95680845, 134506691.99236247,
    134657886.35695586, 134390897.60452515, 135226063.33329535, 135490924.9492251,
    135093288.02499872, 135100378.1836631, 134114153.76629321, 135362836.38550094,
    134744217.06305423, 134451662.97109315, 134829077.22112235, 134418157.3689324,
    134916146.93966413, 134440891.3867167, 134787176.5549223, 134660350.45820063,
    133810022.8238135, 134168764.48050334, 135189035.65126267, 134021049.90450476,
    134903916.71328273, 134656718.33510137, 134943815.04202753, 134797406.3526269,
    134497553.75692537, 134920089.16782558, 133689536.22922617, 134521160.31905597,
    134616922.7392796, 134751380.6347449, 134657054.91462126, 127405348.82547487,
  ],
  'virtual_disk:bytes_written': [
    330917410.0482145, 329709105.37664956, 331010610.525867, 331211447.18977416,
    331261458.46301866, 333203011.6858776, 330456579.5368512, 330592407.1195608,
    330065103.9267523, 332386493.7934591, 330080544.3288696, 330856509.54466516,
    329583271.1448502, 331910771.9026434, 330734831.34536916, 333011595.5327931,
    331531620.2096405, 331001777.99884146, 331080665.690497, 330676206.2135374,
    330371180.3795449, 330571852.06149286, 331177327.99516386, 332699589.00015104,
    329821302.64082146, 331333622.32089734, 331917511.87458974, 330670793.11512905,
    330897663.28819346, 330432756.5197515, 332382792.14725393, 332948541.27419853,
    332114288.1251069, 332207939.69306546, 329606223.2347984, 332657542.783183,
    331140266.22763973, 330498134.19539064, 331298446.3134648, 330326704.5539919,
    331676323.2274062, 330452510.56756794, 331234773.76926625, 330999989.46997416,
    328842918.9281494, 329990105.5430548, 332240433.71217155, 329266790.9013924,
    331503173.65867263, 331081244.1591726, 331573649.42449266, 331311794.6993156,
    330621841.69141155, 331641719.1576536, 328762769.94054705, 330623704.34390384,
    330847001.6152951, 331134733.01985526, 331042258.9105762, 313118482.8823368,
  ],
  'virtual_disk:failed_flushes': [],
  'virtual_disk:failed_reads': [],
  'virtual_disk:failed_writes': [],
  'virtual_disk:flushes': [
    2.5656143915805463, 1.9999135844522231, 1.9999446704324797, 1.9999073598971984,
    2.1666111719868897, 2.4999294767917375, 1.9999226151786687, 1.999938312586908,
    1.999915522549354, 1.9999275117618545, 2.3332884612693365, 1.9999124233153838,
    1.999944451971838, 1.9999203504646035, 2.166586557020626, 2.4999415493091197,
    1.999913840239971, 1.999914091891102, 1.9999696801143712, 1.9999003696836775,
    2.3332789978652286, 1.9999212082005924, 1.9999288190914821, 1.9999268048571393,
    2.1666043432612048, 2.3332758513205545, 1.9999206482596599, 1.9999187185712357,
    1.9999448261708366, 1.9999289269036664, 2.16658295228307, 1.9999438917460528,
    1.9999163542044818, 1.9999354273728318, 2.1665857733228306, 2.499940138876416,
    1.9999269799553812, 1.9999326381486526, 1.9999066832216723, 1.9999346044578068,
    2.1666116384639307, 1.9999251699281135, 1.999935875819479, 1.9999353427672795,
    2.166590416093396, 2.158013910180325, 2.3418311421693914, 1.9999320742404887,
    1.99992307542628, 1.9999462544352449, 2.104945905608691, 2.2282473403754888,
    1.9999123729582473, 1.9999424608149798, 2.1665833832461114, 2.156921598533039,
    2.5096092476281466, 1.9999174120513497, 1.947702169825175, 1.7811086517690107,
  ],
  'virtual_disk:io_latency': [],
  'virtual_disk:io_size': [],
  'virtual_disk:reads': [
    32875.24156785288, 32742.822328425584, 32887.73594062226, 32897.01974676766,
    32899.84724796665, 33094.47384514138, 32812.70485366211, 32834.916712611426,
    32797.39635816606, 33020.40179708033, 32783.878124461684, 32861.77521851955,
    32744.281992359556, 32968.260751779875, 32864.23786157581, 33081.17527008203,
    32928.69283690152, 32866.58995986923, 32895.17448355364, 32845.429148303105,
    32818.40214316456, 32828.58538573866, 32899.731331754025, 33050.526570446236,
    32760.398000638772, 32899.54913489171, 32977.16272905804, 32838.54751554444,
    32875.460840451786, 32810.27714114574, 33014.17444085401, 33078.83922496485,
    32981.76696360247, 32983.48461803678, 32742.71720367538, 33047.564057713025,
    32896.53737696453, 32825.10937564101, 32917.25798549699, 32816.93647036122,
    32938.520033769215, 32822.474496116076, 32907.021717779, 32876.0623673061,
    32668.46702400371, 32756.04290102374, 33005.1346861714, 32719.98266455284,
    32935.52571082768, 32875.18333304324, 32945.261869929476, 32909.522866100415,
    32836.316731826875, 32939.4800212177, 32639.043333491893, 32842.07741645839,
    32865.460697366696, 32898.286514038606, 32875.25480902649, 31104.79807562703,
  ],
  'virtual_disk:writes': [
    80779.20034056324, 80488.39802006751, 80805.80225310395, 80855.15821565613,
    80864.79880246993, 81337.46751659793, 80670.72338169033, 80703.19837050632,
    80575.48791844303, 81141.19990943027, 80578.06175089431, 80766.87480048476,
    80458.1290404043, 81025.74988033365, 80736.79941004828, 81292.50035163287,
    80933.50479856148, 80802.81559906728, 80822.73100302315, 80724.33802652155,
    80648.69871675129, 80698.66854576267, 80847.01468567258, 81216.99268513004,
    80513.73959795143, 80883.5923126427, 81027.21407677184, 80722.84066884329,
    80777.89346683757, 80664.96049183104, 81140.42624987042, 81279.5057398679,
    81074.68704853921, 81098.17386192539, 80461.52192157002, 81205.76385295736,
    80838.0203641813, 80680.73319761816, 80875.17961103571, 80638.83573602898,
    80968.38368631831, 80669.89293196103, 80860.46783615886, 80802.87760515751,
    80274.85330533002, 80553.90436153534, 81106.55873376083, 80380.39855063528,
    80926.057056781, 80823.21953454925, 80942.22206587721, 80879.53974235548,
    80711.39311776291, 80959.22322515622, 80255.65776427352, 80710.42477501076,
    80762.95003772335, 80835.45706264429, 80813.69749658779, 76437.65290335608,
  ],
  'virtual_machine:vcpu_usage': [
    19999244176.55652, 19999262821.770588, 19999247268.325813, 19999256098.18279,
    19998439646.11277, 20000052732.75744, 19999249051.297325, 19999217827.11486,
    19999266289.63109, 19999241540.31689, 19999249894.71948, 19999242798.001175,
    19999280239.558437, 19994941581.138977, 20003329156.62153, 19999072571.09516,
    19999655903.167236, 19999252992.10523, 19999253748.71165, 19992247707.50293,
    20006248335.620003, 19999247240.07144, 19999273682.889553, 19999218798.17299,
    19999239203.481194, 19999249419.079346, 19999201320.508316, 19999007439.8747,
    19998831011.520527, 19985625078.743458, 20012870767.05469, 19999943122.09549,
    19999258008.962036, 19999235779.196056, 19999261171.498962, 19999234237.071968,
    19999276401.99784, 19999251043.36012, 19999255851.52835, 21817322095.449245,
    19999247080.304607, 19999239956.749664, 19997819209.46573, 20000649872.910446,
    19999244996.832375, 19998339267.189194, 20000104884.53485, 19999024248.62954,
    19998728205.98129, 19999177172.982388, 20000001479.01578, 19998692258.842594,
    19999555462.049706, 19999706760.684425, 19999254285.7761, 19999252824.529217,
    19999198522.691017, 19999210125.45697, 19999277909.5477, 18486165951.591064,
  ],
}
const mockOxqlVcpuStateValues: { [key in OxqlVcpuState]: number[] } = {
  emulation: [
    3470554833.148136, 3794070909.515587, 7484378129.162313, 7499079902.563132,
    7338835189.397617, 5769255305.989975, 5793666851.660778, 6119828972.189391,
    6192838967.607052, 6273090517.736208, 6261136594.729165, 6279690022.892301,
    6150635429.510835, 2617373465.0024853, 2625742373.0438843, 2824193724.714241,
    3489569857.2487335, 7492246700.321343, 7389143259.273447, 7412789197.287161,
    5344290281.149027, 5348811353.956265, 6214808219.939896, 6142813148.398594,
    6263147833.517369, 6140102356.026721, 6097867882.707549, 5512181842.324122,
    2675175006.969673, 2740554097.2691655, 2935853047.772752, 2952071677.9638834,
    7546253339.280237, 7486359660.612784, 7463726017.643381, 5444178394.571739,
    5458803598.9091625, 6069021988.3498335, 6311119065.385571, 6608265832.110596,
    6140054386.472407, 6156116158.796333, 5984356298.189145, 2600359658.3245726,
    2584828431.2729354, 2612574521.5035424, 2574626267.071462, 2575424351.817318,
    2575860329.041943, 2567504242.071083, 2556404696.4707775, 2584769411.916215,
    2573581252.249218, 3875742582.642765, 7480290855.256716, 7482930333.717411,
    6712204742.082178, 4122376428.7989264, 4152372065.6415825, 3863464457.366618,
  ],
  run: [
    4619676122.735266, 4857545477.342192, 8402544727.918413, 8469408271.742976,
    8397709487.587893, 8235421457.76976, 8120922799.543821, 6272452681.033177,
    6267237148.905216, 6405902623.449686, 6235219717.385138, 6398062430.261708,
    6329545013.406312, 3743057749.562631, 3866830299.056041, 3877936562.542739,
    4425697223.024854, 8331231027.144771, 8731238036.810953, 8436275940.988695,
    7724787180.289036, 7421040627.989263, 6207097957.785152, 6269698371.290064,
    6233708559.353093, 6245099441.99803, 6206635848.447873, 5671648062.870315,
    3880305795.215807, 3875751695.230483, 3988389511.2728863, 3968133898.58712,
    8460653600.512621, 8482934157.833692, 8470281707.11432, 7716246696.863734,
    7879121504.416253, 6175956981.387113, 6274726366.106583, 6687937195.180018,
    6304116079.054577, 6228856601.421579, 6197732229.89284, 4515917281.7321205,
    4526156837.634188, 4586949674.211767, 4533778060.940317, 4540982515.3752165,
    4509970799.179172, 4545668948.312252, 4558275564.279504, 4557736508.337857,
    4546925189.508583, 5446687815.952005, 8393488265.14876, 8495614671.511756,
    8318175268.861474, 8115602131.165577, 8195384483.89658, 7630602363.416914,
  ],
  idle: [
    11890486373.736158, 11327336534.2248, 4072236015.299429, 3990868655.143588,
    4222573581.249241, 5962618572.6317425, 6052579902.475908, 7579872335.1262665,
    7511465726.918255, 7291900935.990071, 7476049526.072393, 7293334638.012905,
    7491397018.306957, 13619777498.565498, 13495512553.987572, 13281072225.49385,
    12065723282.259262, 4135925261.2616005, 3838889582.975318, 4103088241.392046,
    6904574232.112017, 7198040692.687229, 7550246841.704985, 7559108767.725425,
    7475454104.796597, 7586948506.819914, 7667447990.534256, 8790943969.082865,
    13427888693.820496, 13353587097.462336, 13072393058.06295, 13063295807.40974,
    3952236740.057042, 3988310356.962084, 4024368551.1408396, 6806539447.657919,
    6629148471.374325, 7727269240.680851, 7386056709.533335, 8490705357.374731,
    7527818681.865936, 7586906151.716732, 7788412019.6819935, 12875297306.728258,
    12879240685.46618, 12789932802.353428, 12882754469.322874, 12873708824.54279,
    12903908469.721508, 12877224686.357244, 12876486792.841892, 12847143157.459385,
    12870118909.918638, 10660224475.817593, 4085312757.9752684, 3980043434.9097376,
    4933929614.263907, 7748255370.657822, 7637946572.8268585, 7055896926.060759,
  ],
  waiting: [
    18526846.9369582, 20309900.6880109, 40088395.94565911, 39899268.73309269,
    39321387.87802228, 32757396.365961064, 32079497.61681621, 27063838.766029697,
    27724446.200565398, 28347463.140924186, 26844056.532780677, 28155706.8342591,
    27702778.33433362, 14732868.008363519, 15243930.534035914, 15870058.344331108,
    18665540.634387445, 39850003.37751644, 39982869.651927434, 40094327.83502642,
    32596642.069917694, 31354565.438681442, 27120663.45952057, 27598510.758910026,
    26928705.814134356, 27099114.234683096, 27249598.8186354, 24233565.597403165,
    15461515.514547125, 15732188.78147373, 16235149.946102526, 16441738.134746596,
    40114329.11212887, 41631603.78749817, 40884895.6004194, 32269697.97857898,
    32202827.29810212, 27002832.942324653, 27353710.50286381, 30413710.78390165,
    27257932.91168526, 27361044.815017074, 27318661.701747734, 9075626.125494912,
    9019042.45907371, 8882269.12045705, 8946087.20019712, 8908556.894216128,
    8988608.038667796, 8779296.241807759, 8834425.423605012, 9043181.129137222,
    8930110.373266453, 17051886.27206035, 40162407.395353094, 40664384.3903117,
    34888897.48345601, 12976194.834645452, 13574787.182678783, 12451431.648927957,
  ],
}

export const getMockOxqlInstanceData = (
  name: OxqlMetricName,
  state?: OxqlVcpuState
): Json<OxqlQueryResult> => {
  const values = state ? mockOxqlVcpuStateValues[state] : mockOxqlValues[name]
  return {
    tables: [
      {
        name: name,
        timeseries: {
          // This is a fake metric ID
          '10607783231231666598': {
            fields: {
              instanceId: {
                type: 'uuid',
                value: instances[0].id, // project: mock-project; instance: db1
              },
            },
            points: {
              start_times: [],
              timestamps: timestamps,
              values: [
                {
                  values: {
                    type: 'double',
                    values: values,
                  },
                  metric_type: 'gauge',
                },
              ],
            },
          },
        },
      },
    ],
  }
}
