"use strict";

// Dữ liệu phát triển theo docs/seed-data-vietnamese-cuisine-proposal.md.

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const servingsNote =
      "Định lượng và thời gian mô tả là cho khẩu phần mặc định. Khi đổi số người ăn, tính lại bảng nguyên liệu trước khi nấu; các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi, phần còn lại là lượng chưa dùng. Nguyên liệu không yêu cầu chia thì dùng toàn bộ lượng trong bảng. Giữ kích thước cắt, nhiệt độ và thời gian mỗi mẻ làm mốc, kiểm tra độ chín; chia mẻ khi dụng cụ không đủ chứa. Nước nấu và dầu chiên có thể cần điều chỉnh theo dụng cụ và mức bay hơi.";
    const recipesData = [
      {
        id: 1,
        authorId: 1,
        title: "Canh chua cá lóc miền Tây",
        description:
          "Canh cá lóc vị chua me, có thơm, cà chua, đậu bắp, dọc mùng và rau ngổ; dùng chung trong bữa cơm 4 người. Chuẩn bị 20 phút, nấu 25 phút.\n\nQuy cách nguyên liệu: Cá lóc, khúc còn xương; Me chua chín bỏ hạt.\n\nKhi đổi khẩu phần: Giữ độ dày khúc cá, chọn nồi để cá ngập nước canh mà không phải xếp quá chặt. Chờ nồi sôi trở lại rồi kiểm tra cá chín theo độ dày; chia canh theo số người đang nấu.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269532/tastebook_uploads/una957qnxfqpmeh7vm0t.jpg",
        cookTimeMinutes: 25,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 2,
        authorId: 1,
        title: "Thịt kho tàu nước dừa trứng cút",
        description:
          "Ba chỉ kho nước dừa với trứng cút, vị mặn ngọt dịu, thịt mềm nhưng còn miếng; phiên bản Nam Bộ. Chuẩn bị 20 phút, ướp 30 phút, nấu 75 phút.\n\nKhi đổi khẩu phần: Giữ miếng thịt khoảng 3 cm, chọn nồi để nước kho phủ vừa mặt thịt lúc bắt đầu. Nấu nhiều có thể lâu sôi hơn; kết thúc theo độ mềm và mức nước kho, không nhân 75 phút theo số người.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269594/tastebook_uploads/hbspigqd9hauf2e0fhn0.webp",
        cookTimeMinutes: 75,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 3,
        authorId: 1,
        title: "Phở bò Hà Nội",
        description:
          "Phở nạm chín với nước dùng xương bò, gừng hành nướng, hồi, quế và hạt mùi; không dùng thịt tái trong bản seed này. Chuẩn bị 30 phút, nấu khoảng 4 giờ. Nước dùng thành phẩm mục tiêu 2400 ml cho 4 bát.\n\nKhi đổi khẩu phần: Mục tiêu nước dùng bằng khoảng 600 ml × số phần ăn, không giữ cố định tổng 2400 ml của mẻ gốc. Giữ miếng nạm có độ dày tương tự; nếu nồi không đủ lớn thì chia nồi, chia cả nguyên liệu và gia vị. Thời gian ninh xương không nhân theo số bát.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269633/tastebook_uploads/p0jhwrqov0o1dbrj1mky.webp",
        cookTimeMinutes: 240,
        difficulty: "Hard",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 4,
        authorId: 1,
        title: "Gà xào sả ớt",
        description:
          "Gà lọc xương xào sả ớt, sốt bám nhẹ, hợp bữa cơm gia đình. Chuẩn bị 15 phút, ướp 20 phút, nấu 20 phút.\n\nQuy cách nguyên liệu: Thịt gà ta lọc xương.\n\nKhi đổi khẩu phần: Chảo cần đủ rộng để đảo gà; nấu nhiều thì chia mẻ và chia đều phần dầu, gia vị, nước theo lượng gà mỗi mẻ. Giữ miếng gà 2–3 cm và kiểm tra miếng dày nhất của từng mẻ.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269671/tastebook_uploads/wultafhebuw7skdb9px7.webp",
        cookTimeMinutes: 20,
        difficulty: "Easy",
        defaultServings: 3,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 5,
        authorId: 1,
        title: "Bò lúc lắc",
        description:
          "Bò phi-lê áp chảo nhanh với ớt chuông, hành tây; ăn cùng xà lách và cà chua. Chuẩn bị 15 phút, ướp 15 phút, nấu 10 phút.\n\nKhi đổi khẩu phần: Giữ bò thành khối khoảng 2 cm và chỉ xếp một lớp trên mặt chảo. Tăng số mẻ thay vì kéo dài một lần xào với chảo đầy; chia rau, dầu và tỏi cho từng mẻ tương ứng.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269706/tastebook_uploads/fxtcqitccfiph1pi2o0i.jpg",
        cookTimeMinutes: 10,
        difficulty: "Medium",
        defaultServings: 2,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 6,
        authorId: 1,
        title: "Bún chả Hà Nội",
        description:
          "Bún với chả viên, ba chỉ nướng, đu đủ cà rốt ngâm nhanh và nước mắm pha; rau sống để riêng. Chuẩn bị 25 phút, ướp 45 phút, nướng khoảng 25 phút.\n\nKhi đổi khẩu phần: Giữ lát ba chỉ 4–5 mm và độ dày chả viên, tăng số miếng thay vì làm viên to hơn. Nướng một lớp, chia khay/mẻ nếu cần; mốc 18–25 phút tính cho từng mẻ có độ dày tương tự.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886322/tastebook_uploads/kaymsgft55zttntahrpp.jpg",
        cookTimeMinutes: 25,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 7,
        authorId: 1,
        title: "Nem rán miền Bắc",
        description:
          "Nem nhân heo, tôm, miến và mộc nhĩ, kèm nước chấm chua ngọt; khoảng 16 cuốn nhỏ, 4 người ăn khai vị. Chuẩn bị 35 phút, rán 30 phút.\n\nQuy cách nguyên liệu: Tôm bóc vỏ.\n\nKhi đổi khẩu phần: Giữ kích thước nem và nhiệt độ rán, điều chỉnh số cuốn/số mẻ. Khi nấu ít, dùng chảo nhỏ hơn để đủ độ sâu dầu; số cuốn là ước tính, không phải trường số lượng đã được ứng dụng tự tính.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886502/tastebook_uploads/fhftudnpza717eskobq2.webp",
        cookTimeMinutes: 30,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 8,
        authorId: 1,
        title: "Chả cá lăng thì là kiểu Hà Nội",
        description:
          "Cá lăng ướp riềng mẻ nghệ, nướng sơ rồi đảo cùng hành thì là; ăn với bún, lạc và nước mắm chanh. Bản này chọn nước mắm thay mắm tôm. Chuẩn bị 20 phút, ướp 60 phút, nấu 20 phút.\n\nKhi đổi khẩu phần: Giữ miếng cá khoảng 3 cm, nướng một lớp và chia mẻ đảo cá cùng hành thì là khi chảo đầy. Chia phần dầu dành cho chảo theo lượng cá mỗi mẻ; kiểm tra cá chín ở cả bước nướng và bước đảo cuối.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886570/tastebook_uploads/ja8pmht2ahuwdrpfvqz3.jpg",
        cookTimeMinutes: 20,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 9,
        authorId: 1,
        title: "Xôi ngũ sắc phiên bản nấu tại nhà",
        description:
          "Xôi năm màu trắng, tím lá cẩm, xanh lá dứa, đỏ gấc, vàng nghệ, lấy cảm hứng từ xôi vùng cao phía Bắc. Cách tạo màu gia đình này không đại diện cho toàn bộ kỹ thuật dùng lá của các cộng đồng địa phương. Chuẩn bị 35 phút, ngâm 6 giờ, hấp 45 phút; 5 phần xôi.\n\nQuy cách nguyên liệu: Thịt gấc bỏ hạt.\n\nKhi đổi khẩu phần: Luôn giữ 5 màu, chỉ thay lượng nếp mỗi màu; số màu không phải số người ăn. Giữ lớp nếp tơi và không quá dày, tăng số tầng hoặc chia mẻ hấp; thời gian dựa vào độ dày lớp nếp và độ mềm hạt, không nhân 45 phút theo khẩu phần.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886661/tastebook_uploads/iakeqbrzdbm3wy8wzsh1.jpg",
        cookTimeMinutes: 45,
        difficulty: "Hard",
        defaultServings: 5,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 10,
        authorId: 1,
        title: "Bún bò Huế",
        description:
          "Bún sợi lớn với bắp bò, giò heo, nước dùng thơm sả và mắm ruốc Huế; bản gia đình không thêm huyết/chả. Chuẩn bị 30 phút, nấu 150 phút; mục tiêu 2400 ml nước dùng cho 4 bát.\n\nQuy cách nguyên liệu: Bún tươi loại sợi lớn.\n\nKhi đổi khẩu phần: Tổng nước dùng thành phẩm mục tiêu là khoảng 600 ml × số phần ăn, không cố định 2400 ml. Chọn nồi vừa lượng thịt, không nhồi kín; giữ độ dày khoanh giò/miếng bắp bò tương tự và vớt từng loại khi mềm, không nhân thời gian ninh theo số người.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886733/tastebook_uploads/uwkknr6w9f01h5kol0b7.jpg",
        cookTimeMinutes: 150,
        difficulty: "Hard",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 11,
        authorId: 1,
        title: "Mì Quảng tôm thịt",
        description:
          "Mì Quảng với nhân tôm thịt, nước nhân đậm vị chỉ chan xâm xấp, có rau, lạc và bánh tráng mè. Chuẩn bị 25 phút, ướp 20 phút, nấu 45 phút.\n\nQuy cách nguyên liệu: Tôm bóc vỏ.\n\nKhi đổi khẩu phần: Tổng nước nhân thành phẩm mục tiêu là khoảng 200 ml × số phần ăn; không giữ tổng 800 ml của mẻ gốc. Nấu nhiều thì xào săn thịt theo mẻ trước khi gom vào nồi nấu, giữ nguyên cỡ tôm và độ dày thịt để kiểm tra độ chín.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886849/tastebook_uploads/btgmyorax0bwnswrshze.png",
        cookTimeMinutes: 45,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 12,
        authorId: 1,
        title: "Cơm gà Hội An phiên bản gia đình",
        description:
          "Cơm nấu nước luộc gà và nghệ, gà xé trộn hành tây rau răm, đu đủ cà rốt chua; phiên bản không kèm lòng gà. Chuẩn bị 30 phút, nấu 60 phút.\n\nQuy cách nguyên liệu: Gà ta miếng lớn có xương.\n\nKhi đổi khẩu phần: Giữ cỡ miếng gà, chọn nồi luộc vừa để nước phủ thịt. Tính nước nấu cơm theo lượng gạo đã đổi, không giữ cố định lượng nước của mẻ gốc; dùng nồi cơm đủ dung tích hoặc chia lượt, không nhân thời gian nấu cơm theo số người.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793886947/tastebook_uploads/eyoewmprremeoyuwnjdw.jpg",
        cookTimeMinutes: 60,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 13,
        authorId: 1,
        title: "Bánh bèo chén Huế",
        description:
          "Bánh bột gạo hấp chén nhỏ, mặt tôm chấy và mỡ hành làm bằng dầu; khoảng 24 chén, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nghỉ bột 45 phút, nấu/hấp 35 phút.\n\nQuy cách nguyên liệu: Tôm bóc vỏ.\n\nKhi đổi khẩu phần: Tăng hoặc giảm số chén/số mẻ, giữ chén cùng kích thước và lớp bột mỏng. Khoảng 25 ml là lượng cho một chén nhỏ, không phải lượng nguyên liệu cho cả công thức; số chén ghi trong mô tả là ước tính, dùng hết bột và chia tôm đều theo số chén thực tế.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887014/tastebook_uploads/kcl8lcaftvv15ik8zjns.jpg",
        cookTimeMinutes: 35,
        difficulty: "Hard",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 14,
        authorId: 1,
        title: "Gà nướng mắc khén Tây Bắc",
        description:
          "Gà ướp mắc khén, sả, gừng rồi nướng lò, mô phỏng hương vị gà nướng vùng Tây Bắc trong điều kiện bếp gia đình. Chuẩn bị 20 phút, ướp 2 giờ, nướng 50 phút.\n\nQuy cách nguyên liệu: Gà ta miếng có xương.\n\nKhi đổi khẩu phần: Giữ cỡ miếng gà, xếp thoáng một lớp trên vỉ. Chia khay hoặc nướng nhiều mẻ nếu cần, giữ nhiệt độ lò và kiểm tra từng mẻ; không nướng nguyên một khối gà dày hơn theo hệ số khẩu phần.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887082/tastebook_uploads/lw1ayprbyygrjuf7c8c3.jpg",
        cookTimeMinutes: 50,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 15,
        authorId: 1,
        title: "Bánh xèo miền Tây",
        description:
          "Bánh xèo vỏ mỏng từ bột gạo, nước cốt dừa và nghệ, nhân tôm ba chỉ giá; cuốn rau chấm nước mắm chua ngọt. Khoảng 8 bánh chảo 24–26 cm, 4 phần. Chuẩn bị 30 phút, nghỉ bột 30 phút, nấu 40 phút.\n\nQuy cách nguyên liệu: Tôm bóc vỏ.\n\nKhi đổi khẩu phần: Giữ đường kính chảo và độ mỏng vỏ, thay đổi số bánh/số lượt đổ. Chia nhân và giá theo số bánh thực tế để dùng hết cùng bột; mốc thời gian áp dụng mỗi bánh, tổng thời gian tăng khi có thêm lượt.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887175/tastebook_uploads/h63rsjaofrtkt7pqzldg.jpg",
        cookTimeMinutes: 40,
        difficulty: "Hard",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 16,
        authorId: 1,
        title: "Gỏi cuốn tôm thịt",
        description:
          "Cuốn tôm luộc, ba chỉ, bún và rau, chấm tương hột lạc; khoảng 12 cuốn, 4 phần ăn nhẹ. Chuẩn bị 30 phút, nấu 30 phút.\n\nQuy cách nguyên liệu: Tôm bóc vỏ.\n\nKhi đổi khẩu phần: Tăng giảm số cuốn, không tăng độ dày cuốn. Giữ miếng ba chỉ có độ dày tương tự khi luộc, chọn nồi vừa lượng thịt để nước phủ; làm sốt trong nồi nhỏ phù hợp và kiểm tra độ sánh thay vì chỉ dựa vào thời gian.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887236/tastebook_uploads/yddwiytdbnwaetds3tbm.jpg",
        cookTimeMinutes: 30,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 17,
        authorId: 1,
        title: "Cá hú kho tộ",
        description:
          "Cá hú kho tiêu, hành, nước mắm và nước dừa; sốt nâu sánh nhẹ, hợp cơm nóng. Chuẩn bị 15 phút, ướp 25 phút, nấu 35 phút.\n\nKhi đổi khẩu phần: Giữ khúc cá dày 2–3 cm; chọn nồi rộng vừa để xếp cá ít lớp, chia nồi khi lượng lớn. Điều chỉnh lửa/nắp để nước kho sánh đúng mức, không nhân thời gian kho theo số người.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887307/tastebook_uploads/cmolnnt4vxbvtbz9ghzv.jpg",
        cookTimeMinutes: 35,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 18,
        authorId: 1,
        title: "Cơm tấm sườn nướng",
        description:
          "Cơm gạo tấm, sườn cốt lết nướng, dầu hành, đồ chua và nước mắm pha; phiên bản không có bì/chả trứng. Chuẩn bị 30 phút, ướp ít nhất 2 giờ, nấu khoảng 40 phút do cơm và thịt làm song song.\n\nKhi đổi khẩu phần: Giữ miếng sườn dày 1–1,5 cm, nướng một lớp và chia mẻ nếu cần. Không vượt dung tích nấu của nồi cơm; tăng lượng gạo/nước theo bảng, giữ nhiệt độ nướng và kiểm tra sườn chín gần xương từng mẻ.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887405/tastebook_uploads/qldlw78nmck4twclonyl.png",
        cookTimeMinutes: 40,
        difficulty: "Medium",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 19,
        authorId: 1,
        title: "Đậu phụ kho nấm chay",
        description:
          "Đậu phụ kho nấm rơm, nấm đùi gà và nấm bào ngư, dùng nước tương; món chay ăn cùng cơm. Chuẩn bị 20 phút, nấu 25 phút.\n\nQuy cách nguyên liệu: Nước tương chay.\n\nKhi đổi khẩu phần: Áp chảo đậu một lớp, tăng số mẻ nếu cần; kho trong nồi đủ rộng để đảo nhẹ. Kiểm tra nấm chín và sốt sánh, vì lượng nước tiết ra từ nấm và mức bay hơi thay đổi theo mẻ.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887478/tastebook_uploads/m8abhhf6uwg0ovjymvw2.jpg",
        cookTimeMinutes: 25,
        difficulty: "Easy",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 20,
        authorId: 1,
        title: "Chè chuối nước cốt dừa",
        description:
          "Chè chuối sứ chín, bột báng và nước cốt dừa, vị ngọt vừa; 4 chén tráng miệng. Chuẩn bị 15 phút, ngâm bột báng 20 phút, nấu 25 phút.\n\nQuy cách nguyên liệu: Chuối sứ chín bóc vỏ.\n\nKhi đổi khẩu phần: Giữ độ dày lát chuối, dùng nồi chừa khoảng trống chống trào và khuấy sát đáy. Nồi lớn lâu nóng hơn; thời điểm kết thúc dựa vào chuối mềm, bột báng chín và độ sánh, không nhân thời gian nấu theo số chén.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887540/tastebook_uploads/jglih0ba7dczqovdnugu.jpg",
        cookTimeMinutes: 25,
        difficulty: "Easy",
        defaultServings: 4,
        isPublic: true,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 21,
        authorId: 2,
        title: "Rau muống xào tỏi của Hoang",
        description:
          "Rau muống xào tỏi nước tương, món riêng tư cho bữa tối 2 người của Hoang. Chuẩn bị 12 phút, nấu 8 phút.\n\nQuy cách nguyên liệu: Nước tương chay.\n\nKhi đổi khẩu phần: Giữ độ dài cọng rau, chia mẻ để chảo đủ nóng và rau chín đều. Chia lượng tỏi, dầu, nước và gia vị theo lượng rau mỗi mẻ; không dồn toàn bộ rau vào chảo nhỏ rồi kéo dài thời gian xào.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887705/tastebook_uploads/lfeylopjdlvo56zzkdj3.jpg",
        cookTimeMinutes: 8,
        difficulty: "Easy",
        defaultServings: 2,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 22,
        authorId: 2,
        title: "Trứng chiên hành của Hoang",
        description:
          "Trứng chiên mỏng với hành lá, nước mắm và tiêu, dùng cho bữa cơm nhanh 2 người. Chuẩn bị 5 phút, nấu 8 phút.\n\nKhi đổi khẩu phần: Dùng chảo nhỏ hơn khi nấu ít hoặc chiên nhiều lượt khi nấu nhiều, giữ lớp trứng mỏng tương tự. Thực hiện bước chiên và trở cho từng lượt đến hết hỗn hợp; không tăng độ dày trứng theo số người.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887795/tastebook_uploads/omux8s66kus7rytdxlst.jpg",
        cookTimeMinutes: 8,
        difficulty: "Easy",
        defaultServings: 2,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 23,
        authorId: 3,
        title: "Canh bí đỏ thịt bằm của Lan Anh",
        description:
          "Canh bí đỏ mềm với thịt heo bằm, hành lá, nấu cho bữa cơm 3 người. Chuẩn bị 15 phút, nấu 20 phút.\n\nKhi đổi khẩu phần: Giữ miếng bí khoảng 2 cm và đánh tơi thịt. Chọn nồi đủ chứa, bắt đầu tính thời gian nấu bí khi canh sôi trở lại, kết thúc khi bí mềm vừa; chia canh theo số phần ăn đang nấu.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887883/tastebook_uploads/xjemxisuyuqk4ddbzvb9.png",
        cookTimeMinutes: 20,
        difficulty: "Easy",
        defaultServings: 3,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 24,
        authorId: 3,
        title: "Đậu phụ sốt cà chua của Lan Anh",
        description:
          "Đậu phụ áp chảo sốt cà chua nước mắm chay, ăn với cơm; 3 người. Chuẩn bị 15 phút, nấu 20 phút.\n\nKhi đổi khẩu phần: Giữ miếng đậu khoảng 2 cm và áp chảo một lớp; tăng số mẻ thay vì nhồi chảo. Điều chỉnh lửa/nắp để sốt bám đậu, vì cà chua có thể tiết lượng nước khác nhau.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887935/tastebook_uploads/lw03f2ip7wavq5bhmpvw.jpg",
        cookTimeMinutes: 20,
        difficulty: "Easy",
        defaultServings: 3,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 25,
        authorId: 4,
        title: "Sườn xào chua ngọt của Đức",
        description:
          "Sườn non sốt giấm đường cùng ớt chuông và hành tây; 3 người dùng chung bữa cơm. Chuẩn bị 20 phút, nấu 35 phút.\n\nKhi đổi khẩu phần: Giữ cỡ miếng sườn, dùng nồi vừa để nấu mềm và áp chảo theo mẻ. Nếu chia mẻ hoàn thiện sốt, chia cả rau, sốt, nước nấu sườn và hỗn hợp bột theo lượng sườn mỗi mẻ; kiểm tra độ mềm và độ sánh trước khi tắt bếp.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793887998/tastebook_uploads/kzyqg2gnwzbvmtrzq0ow.jpg",
        cookTimeMinutes: 35,
        difficulty: "Medium",
        defaultServings: 3,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
      {
        id: 26,
        authorId: 4,
        title: "Chè đậu xanh lá dứa của Đức",
        description:
          "Chè đậu xanh cà vỏ, lá dứa và nước cốt dừa; 4 phần tráng miệng. Chuẩn bị 10 phút, ngâm đậu 2 giờ, nấu 35 phút.\n\nKhi đổi khẩu phần: Giữ tỉ lệ đậu, nước và bột theo bảng đã đổi, dùng nồi đủ lớn và khuấy sát đáy. Nấu tới đậu mềm rồi mới thêm đường; lượng lớn cần lâu sôi hơn nhưng không nhân thời gian làm mềm đậu một cách tự động.",
        thumbnailUrl:
          "https://res.cloudinary.com/sf4yjct9/image/upload/v1793888047/tastebook_uploads/ymva7oydemvcb60hc3yw.jpg",
        cookTimeMinutes: 35,
        difficulty: "Easy",
        defaultServings: 4,
        isPublic: false,
        approvalStatus: "Approved",
        rejectionReason: null,
        isDeleted: false,
      },
    ].map((row) => ({
      ...row,
      description: `${row.description}\n\n${servingsNote}`,
      createdAt: now,
      updatedAt: now,
    }));
    const recipeCategoriesData = [
      {
        recipeId: 1,
        categoryId: 2,
      },
      {
        recipeId: 1,
        categoryId: 18,
      },
      {
        recipeId: 2,
        categoryId: 1,
      },
      {
        recipeId: 2,
        categoryId: 3,
      },
      {
        recipeId: 2,
        categoryId: 18,
      },
      {
        recipeId: 3,
        categoryId: 1,
      },
      {
        recipeId: 3,
        categoryId: 5,
      },
      {
        recipeId: 3,
        categoryId: 16,
      },
      {
        recipeId: 4,
        categoryId: 1,
      },
      {
        recipeId: 4,
        categoryId: 4,
      },
      {
        recipeId: 5,
        categoryId: 1,
      },
      {
        recipeId: 5,
        categoryId: 4,
      },
      {
        recipeId: 5,
        categoryId: 18,
      },
      {
        recipeId: 6,
        categoryId: 1,
      },
      {
        recipeId: 6,
        categoryId: 5,
      },
      {
        recipeId: 6,
        categoryId: 10,
      },
      {
        recipeId: 6,
        categoryId: 16,
      },
      {
        recipeId: 7,
        categoryId: 6,
      },
      {
        recipeId: 7,
        categoryId: 11,
      },
      {
        recipeId: 7,
        categoryId: 16,
      },
      {
        recipeId: 8,
        categoryId: 1,
      },
      {
        recipeId: 8,
        categoryId: 10,
      },
      {
        recipeId: 8,
        categoryId: 16,
      },
      {
        recipeId: 9,
        categoryId: 7,
      },
      {
        recipeId: 9,
        categoryId: 12,
      },
      {
        recipeId: 9,
        categoryId: 13,
      },
      {
        recipeId: 9,
        categoryId: 19,
      },
      {
        recipeId: 10,
        categoryId: 1,
      },
      {
        recipeId: 10,
        categoryId: 5,
      },
      {
        recipeId: 10,
        categoryId: 17,
      },
      {
        recipeId: 11,
        categoryId: 1,
      },
      {
        recipeId: 11,
        categoryId: 5,
      },
      {
        recipeId: 11,
        categoryId: 17,
      },
      {
        recipeId: 12,
        categoryId: 1,
      },
      {
        recipeId: 12,
        categoryId: 13,
      },
      {
        recipeId: 12,
        categoryId: 17,
      },
      {
        recipeId: 13,
        categoryId: 6,
      },
      {
        recipeId: 13,
        categoryId: 12,
      },
      {
        recipeId: 13,
        categoryId: 15,
      },
      {
        recipeId: 13,
        categoryId: 17,
      },
      {
        recipeId: 14,
        categoryId: 1,
      },
      {
        recipeId: 14,
        categoryId: 10,
      },
      {
        recipeId: 14,
        categoryId: 19,
      },
      {
        recipeId: 15,
        categoryId: 1,
      },
      {
        recipeId: 15,
        categoryId: 11,
      },
      {
        recipeId: 15,
        categoryId: 15,
      },
      {
        recipeId: 15,
        categoryId: 18,
      },
      {
        recipeId: 16,
        categoryId: 6,
      },
      {
        recipeId: 16,
        categoryId: 14,
      },
      {
        recipeId: 16,
        categoryId: 18,
      },
      {
        recipeId: 17,
        categoryId: 1,
      },
      {
        recipeId: 17,
        categoryId: 3,
      },
      {
        recipeId: 17,
        categoryId: 18,
      },
      {
        recipeId: 18,
        categoryId: 1,
      },
      {
        recipeId: 18,
        categoryId: 10,
      },
      {
        recipeId: 18,
        categoryId: 13,
      },
      {
        recipeId: 18,
        categoryId: 18,
      },
      {
        recipeId: 19,
        categoryId: 1,
      },
      {
        recipeId: 19,
        categoryId: 3,
      },
      {
        recipeId: 19,
        categoryId: 7,
      },
      {
        recipeId: 20,
        categoryId: 7,
      },
      {
        recipeId: 20,
        categoryId: 8,
      },
      {
        recipeId: 20,
        categoryId: 18,
      },
      {
        recipeId: 21,
        categoryId: 4,
      },
      {
        recipeId: 21,
        categoryId: 7,
      },
      {
        recipeId: 21,
        categoryId: 20,
      },
      {
        recipeId: 22,
        categoryId: 1,
      },
      {
        recipeId: 22,
        categoryId: 11,
      },
      {
        recipeId: 22,
        categoryId: 20,
      },
      {
        recipeId: 23,
        categoryId: 2,
      },
      {
        recipeId: 23,
        categoryId: 21,
      },
      {
        recipeId: 24,
        categoryId: 1,
      },
      {
        recipeId: 24,
        categoryId: 7,
      },
      {
        recipeId: 24,
        categoryId: 21,
      },
      {
        recipeId: 25,
        categoryId: 1,
      },
      {
        recipeId: 25,
        categoryId: 4,
      },
      {
        recipeId: 25,
        categoryId: 22,
      },
      {
        recipeId: 26,
        categoryId: 7,
      },
      {
        recipeId: 26,
        categoryId: 8,
      },
      {
        recipeId: 26,
        categoryId: 22,
      },
    ];

    await queryInterface.bulkInsert("Recipes", recipesData);
    await queryInterface.bulkInsert("RecipeCategories", recipeCategoriesData);

    try {
      await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('\"Recipes\"', 'id'), coalesce(max(id), 1)) FROM \"Recipes\";",
      );
    } catch (error) {
      console.error("Error setting sequence for Recipes:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("RecipeCategories", null, {});
    await queryInterface.bulkDelete("Recipes", null, {});
  },
};
