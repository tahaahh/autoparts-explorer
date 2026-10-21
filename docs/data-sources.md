# مصادر البيانات المجانية: التغطية، الترخيص، والجدوى

## النتيجة العملية

لا يوجد ضمن المصادر الرسمية التي راجعناها كتالوج OEM عالمي مجاني قابل لإعادة التوزيع دون اتصال، يضم الرسوم التفجيرية وأرقام القطع والتوافق. فتح صفحة بحث عامة أو وجود API لا يمنح حق نسخ قاعدة بيانات أو تحويلها إلى حزمة عامة. لذلك يحتوي التطبيق الآن على قاعدة أسماء سيارات مفتوحة منفصلة، بينما تظل بيانات القطع والمخططات الحقيقية خالية إلى أن تتوفر مصادر وإذن إعادة توزيع واضحان. [31] [32] [33] [34] [35] [36] [37] [39]

## الحزمة المضمنة في المستودع

يتضمن المستودع حزمة اختيارية مولّدة من إصدار VehiclesDB المفتوح `v2026.10.4` المنشور بتاريخ 2026-10-12. تحوي 5,541 اسم طراز سيارات من 315 شركة. ويذكر بيان المصدر 18 دولة بوصفها نطاق التغطية العام، لكنه لا يقول إن كل طراز متاح في كل واحدة منها. الملف المختصر لا يزود التطبيق بأجيال أو سنوات أو محركات أو رسومات أو قطع أو ملاءمة. [1] [4]

الحزمة القابلة للاستيراد هي `data/packs/vehiclesdb-open-cars.json`. ويحتفظ المشروع كذلك بالملف الأصلي المضغوط وبيان الإصدار والترخيص وإشعارات الإسناد تحت `data/packs/vehiclesdb/`. الترخيص المعلن للطبقة المفتوحة هو CC BY 4.0، ويتطلب إسناداً مرئياً إلى VehiclesDB مع رابط. إشعارات مصادر البيانات الأصلية تبقى مطلوبة كذلك، وبعضها له شروطه الخاصة؛ لذلك أرفقنا ملف `ATTRIBUTION.md` كما نُشر ولم نعد بترخيص هذه المواد من جديد. يظهر رابط الإسناد داخل تبويب البيانات بعد تحميل الحزمة. [1] [2] [3]

لتحميلها في التطبيق، افتح تبويب **البيانات** واضغط زر تحميل أسماء السيارات، ثم وافق على استبدال البيانات المحلية. يمكن أيضاً تنزيل JSON واستيراده يدوياً. لتحديثها يدوياً في المستقبل، استخدم إصداراً منشوراً مرخصاً من المصدر، واحتفظ بإشعاراته، ثم شغّل `python3 tools/convert_vehiclesdb.py <vehicles.min.json> <output.json>`؛ وتحقق من النتيجة بـ `python3 tools/validate_pack.py <output.json>`. لا يولد المحول سنوات أو أسواقاً أو محركات غير موجودة في المصدر.

## مصادر هوية المركبات والمواصفات

**VehiclesDB** هو أفضل نقطة بداية مجانية عثرنا عليها لقائمة أسماء الشركات والطرازات. هو تصنيف أسماء مركبات واسع لكنه غير عالمي التغطية، ولا يضم كتالوج قطع أو توافقاً. بيانات الطبقة المفتوحة لها CC BY 4.0، مع ضرورة حفظ الإسناد وشروط كل مصدر أولي في ملف الإسناد. سجل الشركة/الطراز غير متساوٍ حسب البلد، وغياب الحقل يعني أن المصدر لم يوفره، لا أن المعلومة غير موجودة. [1] [2] [3] [4]

**NHTSA vPIC** مفيد لتمييز مركبات موجهة غالباً إلى الولايات المتحدة، وفك VIN، وبعض بيانات الشركة المصنّعة مثل نوع الهيكل أو مكونات المحرك والوقود. توثيق NHTSA يصف نطاقاً يبدأ من معيار VIN الحديث، ويذكر أن المركبات غير الموجهة للبيع أو الاستيراد إلى الولايات المتحدة قد تعطي بيانات محدودة. ويمكن تنزيل قواعد منفصلة لبعض عمليات فك VIN للعمل دون إنترنت. لكنه ليس فهرس قطع، كما أن وثائقه التي راجعناها لا تمنح ترخيصاً واضحاً لإعادة نشر حزمة مركبات عالمية؛ لذلك لا يُنسخ جماعياً إلى التطبيق حتى تتضح الشروط. كما أن `GetParts` في API يعرض مستندات وملفات تنظيمية، لا أجزاء إصلاح أو رسومات OEM. [5] [6] [7]

**Wikidata** قاعدة متعددة اللغات ومحتواها المنظم الأساسي تحت CC0، ويمكن استخدامها لإثراء أسماء الشركات والكيانات والروابط. التغطية مجتمعية وغير مكتملة، ولم نعثر على مخطط معياري موثوق يحدد أجيال السيارات بصورة موحدة. الأفضل استخراج مجموعة فرعية من سجلات لها مراجع مناسبة، مع حفظ معرّفات المصدر وتاريخ التصدير. تنزيل dump كامل غير عملي لتطبيق هاتف؛ توصي وثائق الوصول باستخدام dumps للاستخراج الكبير بدلاً من استعلامات SPARQL العامة. صور الكيانات لها تراخيص مستقلة في Commons ولا يشملها CC0 الخاص بالحقائق المنظمة. [12] [13] [14] [15] [16]

**CarQuery** يوثق واجهة لاختيار السنة والشركة والطراز والفئة وبعض حقول مواصفات المحرك. لكن الصفحة الرسمية لا تؤكد أن الخدمة مجانية، وتمنع شروط API الاحتفاظ بنسخ من البيانات دون شراء منفصل. إذن الاستخدام محدود باستدعاءات مباشرة وتقديم النتائج للمستخدم فوراً عبر موقع المرخص له؛ لا يناسب قاعدة بيانات محلية أو حزمة Android دون ترخيص مختلف. كما أن توثيق الواجهة قديم والخدمة لم تُتحقق مباشرة في وقت البحث. لا نستخدمه للحزمة المحلية. [21] [22] [23] [24]

## السلامة والصور والرسوم

تقدم **NHTSA Recalls وODI Complaints** APIs وملفات رسمية لمعلومات السلامة الأمريكية. يمكن أن تتضمن سجلات الاستدعاء رقم مكوّن أبلغت عنه الشركة، لكن هذا ليس رقماً بديلاً صالحاً لكل سيارة ولا يثبت توافقاً. الشكاوى بلاغات وليست تشخيصاً مؤكداً. يمكن حفظها كمعلومات سلامة منفصلة مع تاريخ السجل، ولا ينبغي تحويلها إلى كتالوج قطع. للاستخراج الدفعي أو غير المتصل، توصي وثائق NHTSA بالملفات المسطحة بدلاً من استعلامات VIN الجماعية. شروط الموقع تقول إن المعلومات المنشورة عامة ويمكن نسخها، لكنها تنفي ضمان الدقة أو الاكتمال؛ يجب إبقاء حدود المصدر ظاهرة. [8] [9] [10] [11]

**Wikimedia Commons** يصلح لصور ورسوم تعليمية مختارة؛ لكن لكل ملف صفحة ورخصة وإسناد خاصان. راجع المؤلف والترخيص وشروط التعديلات وShareAlike قبل التضمين، واحفظ نسخة محلية مع سجل مصدرها كي تعمل دون اتصال. وجود رسم في Commons ليس ضماناً لصحة الرسم أو ملكية حقوقه، ولا يجعل رسومات OEM المحمية حرة تلقائياً. [17] [18] [19] [20]

## مصادر غير مناسبة للخطة المجانية الحالية

**Auto Care ACES وPIES** معيارا تبادل، وليسَا قاعدة قطع عامة جاهزة. ACES ينظم رسائل توافق المنتج مع المركبة، وPIES ينظم معلومات المنتج. يقول Auto Care إن ACES/VCdb ليس كتالوج قطع وإنه لا يشغل مجمعاً شاملاً لبيانات الصناعة. إتاحة بعض الوثائق أو العينات بحساب مجاني لا تجعل قواعد البيانات المرجعية مجانية: قواعد VCdb/Qdb/PCdb وPAdb تقدم باشتراك سنوي، وشروط الترخيص تعتبر المعرّفات والتصنيفات والترجمات ملكية مرخصة. يلزم ترخيص مكتوب قبل إدراجها أو إعادة توزيعها. [25] [26] [27] [28] [29] [30]

بوابات الشركات المصنعة، ومنها Toyota وHonda وVolkswagen في الأسواق التي راجعناها، تتيح بدرجات مختلفة البحث أو شراء معلومات قطع/خدمة. لكنها لا تعرض رخصة بيانات مفتوحة لنسخ كتالوج عالمي. شروط Honda تمنع الجمع المنهجي لبناء قاعدة بيانات دون إذن، وشروط Toyota Australia تحدّ من النسخ وإعادة النشر، وشروط VW erWin تقيد التوزيع والنسخ؛ وبيانات VW Group Hub تتطلب اتفاق توزيع منفصل وتحظر إعادة التوزيع دون إذن صريح. هذه أمثلة تمثيلية وليست مراجعة لكل مصنع أو بلد. لا تُنقل الرسومات أو الأرقام من صفحات البحث إلى الحزمة إلا بموافقة مكتوبة تغطي التخزين والاستخدام دون اتصال وإعادة التوزيع. [31] [32] [33] [34] [35] [36] [37] [38] [39] [40]

## قواعد قبول أي مصدر مستقبلي

- نحتفظ باسم المصدر والرابط والإصدار وتاريخ الالتقاط والرخصة ونص الإسناد مع كل حزمة.
- نميز بين «غير متوفر في هذا المصدر» و«غير موجود»؛ ولا نملأ القيم المفقودة باستنتاجات.
- لا نعرض رقم OEM أو توافقاً مؤكداً إلا إذا توفر دليل قابل للتتبع يطابق نسخة السيارة والمحرك والسوق/السنة المعنية.
- لكل رسم أو صورة سجل مستقل للمؤلف والمصدر والرخصة وقيود التعديل؛ وإذا لم يوجد إذن إعادة توزيع فلا تضاف إلى الحزمة.
- أداة التحقق في `tools/validate_pack.py` تفحص البنية ووجود بيانات الترخيص والمصدر، ولا تثبت صحة الحقائق أو صحة الرخصة قانونياً.

## المراجع

[1]: https://github.com/vehiclesdb/vehiclesdb/releases/tag/v2026.10.4 "VehiclesDB open release v2026.10.4"
[2]: https://github.com/vehiclesdb/vehiclesdb/blob/main/LICENSE "VehiclesDB dataset license"
[3]: https://github.com/vehiclesdb/vehiclesdb/blob/main/ATTRIBUTION.md "VehiclesDB required attribution and upstream notices"
[4]: https://github.com/vehiclesdb/vehiclesdb/blob/main/SCHEMA.md "VehiclesDB catalog schema"
[5]: https://vpic.nhtsa.dot.gov/About "NHTSA vPIC about page"
[6]: https://vpic.nhtsa.dot.gov/api/ "NHTSA vPIC API documentation"
[7]: https://vpic.nhtsa.dot.gov/downloads/ "NHTSA vPIC downloads"
[8]: https://www.nhtsa.gov/nhtsa-datasets-and-apis "NHTSA datasets and APIs"
[9]: https://static.nhtsa.gov/odi/ffdd/rcl/RCL.txt "NHTSA recall flat-file dictionary"
[10]: https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt "NHTSA complaint flat-file dictionary"
[11]: https://www.nhtsa.gov/about-nhtsa/terms-use "NHTSA terms of use"
[12]: https://www.wikidata.org/wiki/Wikidata:Licensing "Wikidata licensing"
[13]: https://www.wikidata.org/wiki/Wikidata:Data_access "Wikidata data access"
[14]: https://www.wikidata.org/wiki/Wikidata:Database_download "Wikidata database download"
[15]: https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual "Wikidata Query Service user manual"
[16]: https://www.wikidata.org/wiki/Property:P176 "Wikidata manufacturer property"
[17]: https://commons.wikimedia.org/wiki/Commons:Licensing "Wikimedia Commons licensing"
[18]: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia "Wikimedia Commons reuse guide"
[19]: https://commons.wikimedia.org/wiki/Commons:API "Wikimedia Commons API"
[20]: https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_subject_matter "Wikimedia Commons copyright rules by subject matter"
[21]: http://www.carqueryapi.com/about/terms-and-conditions/ "CarQuery API terms and conditions"
[22]: https://www.carqueryapi.com/about/ "CarQuery about page"
[23]: https://www.carqueryapi.com/documentation/ "CarQuery API documentation"
[24]: https://github.com/wp-plugins/carquery-api/blob/master/carquery-api.php "CarQuery WordPress plugin source"
[25]: https://www.autocare.org/aces "Auto Care ACES standard"
[26]: https://www.autocare.org/pies "Auto Care PIES standard"
[27]: https://www.autocare.org/about-us/frequently-asked-questions "Auto Care frequently asked questions"
[28]: https://www.autocare.org/data-standards/subscriptions "Auto Care data subscriptions"
[29]: https://www.autocare.org/data-and-information/data-standards/databases/vehicle-configuration-database-vcdb "Auto Care Vehicle Configuration database"
[30]: https://www.autocare.org/docs/default-source/data-standards/technology-license-agreement_02282025.pdf "Auto Care technology license agreement"
[31]: https://autoparts.toyota.com/ "Toyota USA parts center"
[32]: https://www.toyota.com.au/owners/parts "Toyota Australia genuine parts"
[33]: https://www.toyota.com.au/policies/conditions "Toyota Australia conditions of use"
[34]: https://dreamshop.honda.com/s/category/honda-parts/0ZG6g000000XfPVGA0 "Honda DreamShop parts portal"
[35]: https://www.honda.com/privacy/terms-and-conditions "American Honda terms and conditions"
[36]: https://erwin.vw.com/ "Volkswagen erWin service information"
[37]: https://erwin.vw.com/erwin/registerCustomer.do "Volkswagen erWin registration terms"
[38]: https://erwin.vw.com/erwin/showSubscriptionComparison.do "Volkswagen erWin subscription comparison"
[39]: https://drivesomethinggreater.com/service/terms-of-use "Volkswagen Group Data Hub terms of use"
[40]: https://global.toyota/en/terms-of-use/index.html "Toyota Motor global terms of use"
