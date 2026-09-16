import { AIAnalysisResult, CartoonCharacterInfo, CartoonCharacterType, QuizQuestion, AppLanguage } from '../types';

export function resolveCartoonCharacter(
  result: AIAnalysisResult,
  language: AppLanguage = 'en'
): CartoonCharacterInfo {
  // If backend already gave a valid cartoon character with an explanation, use it
  const validCharacterTypes: CartoonCharacterType[] = ['animal', 'plant', 'astronaut', 'scientist', 'teacher'];
  if (
    result.cartoonCharacter &&
    validCharacterTypes.includes(result.cartoonCharacter.type) &&
    result.cartoonCharacter.explanation
  ) {
    return result.cartoonCharacter;
  }

  const isTamil = language === 'ta';

  const textToCheck = [
    result.mainSubject,
    result.headline,
    result.primaryCategory,
    result.childDescription,
    ...(result.identified?.animals || []),
    ...(result.identified?.plants || []),
    ...(result.identified?.objects || []),
    ...(result.identified?.places || []),
    ...(result.identified?.educationalContent || []),
  ].join(' ').toLowerCase();

  // 1. Animal check
  const animalKeywords = ['animal', 'dog', 'cat', 'elephant', 'lion', 'tiger', 'bird', 'bear', 'rabbit', 'fish', 'monkey', 'panda', 'horse', 'cow', 'sheep', 'duck', 'frog', 'insect', 'butterfly', 'pet', 'wildlife', 'mammal', 'விலங்கு', 'யானை', 'பூனை', 'நாய்', 'பறவை', 'மீன்'];
  if (animalKeywords.some(kw => textToCheck.includes(kw))) {
    return {
      type: 'animal',
      name: isTamil ? 'பர்னபி கரடி' : 'Barnaby Bear',
      role: isTamil ? 'கார்ட்டூன் விலங்கு வழிகாட்டி' : 'Cartoon Animal Guide',
      explanation: isTamil
        ? `வணக்கம் குட்டி நண்பா! நான் பர்னபி கரடி! விலங்குகள் நம் உலகத்தின் அற்புதமான உயிரினங்கள். அவை உணவு உண்டு, விளையாடி, சுவாசித்து வாழ்கின்றன!`
        : `Hello little explorer! I'm Barnaby Bear! Animals like the ${result.mainSubject || 'one in your picture'} are amazing living creatures. They breathe, eat tasty foods, move around to explore, and have special features to help them thrive!`,
    };
  }

  // 2. Plant check
  const plantKeywords = ['plant', 'flower', 'tree', 'leaf', 'leaves', 'fruit', 'apple', 'banana', 'orange', 'vegetable', 'garden', 'grass', 'rose', 'sunflower', 'stem', 'seed', 'forest', 'nature', 'தாவரம்', 'செடி', 'மரம்', 'பூ', 'மலர்', 'இலை', 'பழம்'];
  if (plantKeywords.some(kw => textToCheck.includes(kw))) {
    return {
      type: 'plant',
      name: isTamil ? 'முளை மலர்' : 'Sprout Blossom',
      role: isTamil ? 'கார்ட்டூன் தாவர நண்பன்' : 'Cartoon Plant Friend',
      explanation: isTamil
        ? `வணக்கம் செல்லமே! நான் முளை மலர்! செடிகளுக்கு வளர நல் தண்ணீரும் இதமான சூரிய ஒளியும் தேவை! அவை நம் உலகை தூய்மையாகவும் பசுமையாகவும் வைக்கின்றன!`
        : `Hi there! I'm Sprout the Blossom! Plants like the ${result.mainSubject || 'one in your picture'} love drinking fresh water and soaking up bright sunshine! They make our world green, fresh, and full of wonderful sweet air!`,
    };
  }

  // 3. Space check
  const spaceKeywords = ['space', 'star', 'stars', 'planet', 'moon', 'sun', 'solar', 'rocket', 'astronaut', 'galaxy', 'meteor', 'telescope', 'comet', 'mars', 'jupiter', 'orbit', 'sky', 'night', 'விண்வெளி', 'நிலா', 'நட்சத்திரம்', 'கிரகம்', 'சூரியன்', 'ராக்கெட்'];
  if (spaceKeywords.some(kw => textToCheck.includes(kw))) {
    return {
      type: 'astronaut',
      name: isTamil ? 'விண்வெளி வீரர் காஸ்மோ' : 'Cosmo Astronaut',
      role: isTamil ? 'கார்ட்டூன் விண்வெளி ஆய்வாளர்' : 'Cartoon Space Explorer',
      explanation: isTamil
        ? `3... 2... 1... ராக்கெட் பறக்கிறது! நான் காஸ்மோ! வானத்தில் உள்ள நட்சத்திரங்களும் கோள்களும் எண்ணற்ற ஆச்சரியங்கள் நிறைந்தவை! வாருங்கள் சேர்ந்து ஆராய்வோம்!`
        : `3... 2... 1... Blastoff! I'm Cosmo the Astronaut! Looking at ${result.mainSubject || 'your picture'} is like discovering a sparkling mystery in outer space! Everything in our universe has amazing cosmic rules to explore!`,
    };
  }

  // 4. Science check
  const scienceKeywords = ['science', 'scientist', 'experiment', 'chemistry', 'magnet', 'lab', 'laboratory', 'beaker', 'microscope', 'electric', 'energy', 'water', 'rock', 'mineral', 'weather', 'cloud', 'liquid', 'metal', 'force', 'அறிவியல்', 'ஆராய்ச்சி', 'காந்தம்', 'மின்னியல்'];
  if (scienceKeywords.some(kw => textToCheck.includes(kw))) {
    return {
      type: 'scientist',
      name: isTamil ? 'டாக்டர் ஸ்பார்க்' : 'Dr. Spark',
      role: isTamil ? 'கார்ட்டூன் அறிவியல் தோழன்' : 'Cartoon Science Buddy',
      explanation: isTamil
        ? `யூரேகா! நான் அறிவியல் விஞ்ஞானி டாக்டர் ஸ்பார்க்! அறிவியல் என்பது நம்மைச் சுற்றியுள்ள பொருட்கள் எவ்வாறு இயங்குகின்றன என்பதைக் கண்டறியும் அற்புத வழி!`
        : `Eureka! I'm Dr. Spark the Scientist! When we look at ${result.mainSubject || 'this picture'}, we are asking big scientific questions! Science helps us figure out how things work, why they change, and how we can invent new things!`,
    };
  }

  // 5. Textbook / Teacher / General Educational Object default
  return {
    type: 'teacher',
    name: isTamil ? 'சன்னி ஆசிரியை' : 'Miss Sunny',
    role: isTamil ? 'கார்ட்டூன் ஆசிரியர்' : 'Cartoon Teacher',
    explanation: isTamil
      ? `வணக்கம் குழந்தைகளே! நான் உங்கள் சன்னி ஆசிரியை! உங்கள் படம் மிக அழகாக இருக்கிறது! ஒவ்வொரு படத்திலும் பல புதிய வண்ணங்களும், வடிவங்களும், நல்ல கதைகளும் உள்ளன!`
      : `Welcome class! I'm Miss Sunny, your cartoon teacher! The ${result.mainSubject || 'item in your picture'} is filled with fascinating lessons. By observing its shapes, colors, and uses, you are learning something wonderful today!`,
  };
}

export function resolveQuizQuestions(
  result: AIAnalysisResult,
  language: AppLanguage = 'en'
): QuizQuestion[] {
  const isTamil = language === 'ta';

  // If backend provided valid quiz questions, sanitize and return them
  if (Array.isArray(result.quizQuestions) && result.quizQuestions.length > 0) {
    const valid = result.quizQuestions
      .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
      .map((q, idx) => ({
        id: q.id || `q-${idx + 1}`,
        question: q.question,
        options: q.options.slice(0, 3),
        correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.options.length ? q.correctAnswerIndex : 0,
        encouragement: q.encouragement || (isTamil ? 'அற்புதம்! நீங்கள் மிக அழகாகக் கற்றுக்கொண்டீர்கள்!' : 'Terrific job! You learned so much from this picture!'),
      }));
    if (valid.length >= 2) {
      return valid.slice(0, 3);
    }
  }

  const subject = result.mainSubject || (isTamil ? 'இந்த பொருள்' : 'this subject');
  const category = (result.primaryCategory || '').toLowerCase();
  const textCheck = [subject, category, result.headline, result.childDescription].join(' ').toLowerCase();

  if (isTamil) {
    // Plants in Tamil
    if (textCheck.includes('plant') || textCheck.includes('flower') || textCheck.includes('tree') || textCheck.includes('தாவர') || textCheck.includes('செடி') || textCheck.includes('மரம்') || textCheck.includes('பூ')) {
      return [
        {
          id: 'plant-q1',
          question: 'செடிகள் பச்சையாகவும் ஆரோக்கியமாகவும் வளர என்ன தேவை?',
          options: ['தண்ணீர் மற்றும் சூரிய ஒளி', 'சாக்லேட் மற்றும் மிட்டாய்', 'விளையாட்டு பொம்மைகள்'],
          correctAnswerIndex: 0,
          encouragement: 'அற்புதம்! செடிகள் வளர சுத்தமான தண்ணீரும் இதமான சூரிய ஒளியும் தேவை!',
        },
        {
          id: 'plant-q2',
          question: `நாம் படத்தில் பார்த்த அற்புதமான விஷயம் எது?`,
          options: [`${subject}`, 'விண்கல இயந்திரம்', 'கார்ட்டூன் காலணி'],
          correctAnswerIndex: 0,
          encouragement: `சரியான பதில்! நீங்கள் ${subject} என்பதை மிகச் சரியாகக் கண்டறிந்தீர்கள்!`,
        },
        {
          id: 'plant-q3',
          question: 'செடிகளும் மரங்களும் பூமிக்கு எவ்வாறு உதவுகின்றன?',
          options: ['சுத்தமான புதிய காற்றைத் தருகின்றன', 'வீடியோ கேம் விளையாடுகின்றன', 'வானில் பறக்கின்றன'],
          correctAnswerIndex: 0,
          encouragement: 'சூப்பர் ஸ்டார்! மரங்கள் நாம் சுவாசிக்க நல்ல காற்றையும் குளிர்ந்த நிழலையும் தருகின்றன!',
        },
      ];
    }

    // Animals in Tamil
    if (textCheck.includes('animal') || textCheck.includes('dog') || textCheck.includes('cat') || textCheck.includes('விலங்கு') || textCheck.includes('யானை') || textCheck.includes('பூனை') || textCheck.includes('பறவை')) {
      return [
        {
          id: 'animal-q1',
          question: `${subject} என்பது என்ன வகையான உயிரி?`,
          options: ['ஓர் அழகான விலங்கு', 'ஒரு செங்கல்', 'ஒரு தொலைக்காட்சி'],
          correctAnswerIndex: 0,
          encouragement: `மிகச் சிறப்பு! ${subject} என்பது நம் பூமியில் வாழும் ஓர் அழகான விலங்கு!`,
        },
        {
          id: 'animal-q2',
          question: 'விலங்குகள் சுறுசுறுப்பாகவும் மகிழ்ச்சியாகவும் இருக்க என்ன தேவை?',
          options: ['நல்ல உணவு, தூய நீர் மற்றும் ஓய்வு', 'மின்கலங்கள் (பேட்டரிகள்)', 'காசுகள் மற்றும் சாவிகள்'],
          correctAnswerIndex: 0,
          encouragement: 'அருமை! விலங்குகளுக்கும் நம்மைப் போலவே நல்ல உணவும் தண்ணீரும் தேவை!',
        },
        {
          id: 'animal-q3',
          question: 'விலங்குகள் உலகை எதன் மூலம் அறிந்துகொள்கின்றன?',
          options: ['பார்வை, வாசனை போன்ற புலன்கள் மூலம்', 'செய்தித்தாள் படித்து', 'லிஃப்டில் ஏறி'],
          correctAnswerIndex: 0,
          encouragement: 'மிக அருமை! விலங்குகள் தங்களின் கூரிய பார்வை மற்றும் வாசனை மூலம் தெரிந்துகொள்கின்றன!',
        },
      ];
    }

    // Space in Tamil
    if (textCheck.includes('space') || textCheck.includes('star') || textCheck.includes('விண்வெளி') || textCheck.includes('நிலா') || textCheck.includes('கிரகம்')) {
      return [
        {
          id: 'space-q1',
          question: 'நட்சத்திரங்களையும் நிலவையும் நாம் எங்கே பார்க்கிறோம்?',
          options: ['இரவு வானிலும் விண்வெளியிலும்', 'பள்ளிப் பைக்குள்', 'மேசைக்கு அடியில்'],
          correctAnswerIndex: 0,
          encouragement: 'ராக்கெட் பறந்தது! இரவு வானில் விண்வெளியில்தான் நட்சத்திரங்கள் மின்னுகின்றன!',
        },
        {
          id: 'space-q2',
          question: 'விண்வெளி வீரர்கள் எதில் பயணம் செய்வார்கள்?',
          options: ['சக்திவாய்ந்த விண்வெளி ராக்கெட்', 'சைக்கிள்', 'மரப் படகு'],
          correctAnswerIndex: 0,
          encouragement: 'அற்புதம்! சக்திவாய்ந்த ராக்கெட்டுகள் மூலமாக விண்வெளி வீரர்கள் பறக்கிறார்கள்!',
        },
      ];
    }

    // General in Tamil
    return [
      {
        id: 'general-q1',
        question: 'இன்று நாம் படத்தில் எதைப் பார்த்துப் புது விஷயம் கற்றுக்கொண்டோம்?',
        options: [`${subject}`, 'பறக்கும் டிராகன்', 'பனிக்கூழ் (ஐஸ்கிரீம்)'],
        correctAnswerIndex: 0,
        encouragement: `அருமை! நீங்கள் ${subject} பற்றி மிகக் கவனமாகக் கற்றுக்கொண்டீர்கள்!`,
      },
      {
        id: 'general-q2',
        question: 'புதிய விஷயங்களைக் கற்றுக்கொள்ள குட்டி ஆய்வாளர்கள் என்ன செய்வார்கள்?',
        options: ['உற்று கவனித்துக் கேள்விகள் கேட்பார்கள்', 'கண்களை மூடிக்கொள்வார்கள்', 'வண்ணங்களை மறைப்பார்கள்'],
        correctAnswerIndex: 0,
        encouragement: 'சபாஷ்! ஆர்வத்துடன் கவனிப்பதும் கேள்வி கேட்பதும்தான் சிறந்த பழக்கம்!',
      },
      {
        id: 'general-q3',
        question: 'புதிய வடிவங்களையும் வண்ணங்களையும் கற்றுக்கொள்வதால் என்ன பயன்?',
        options: ['நம் மூளை புத்திசாலியாக வளரும்', 'காலணி உருகிவிடும்', 'முடி நீல நிறமாகும்'],
        correctAnswerIndex: 0,
        encouragement: 'சூப்பர் ஸ்டார்! தினமும் புது விஷயங்களைக் கற்பது நமது சிந்தனைத் திறனை உயர்த்தும்!',
      },
    ];
  }

  // Plants
  if (textCheck.includes('plant') || textCheck.includes('flower') || textCheck.includes('tree') || textCheck.includes('leaf') || textCheck.includes('fruit')) {
    return [
      {
        id: 'plant-q1',
        question: 'What do plants need to grow big, green, and strong?',
        options: ['Water and sunlight', 'Chocolate and candy', 'Toys and games'],
        correctAnswerIndex: 0,
        encouragement: 'Awesome job! Plants drink refreshing water and soak up warm sunshine to make their food!',
      },
      {
        id: 'plant-q2',
        question: `What is the wonderful plant part we explored here?`,
        options: [`${subject}`, 'A spaceship engine', 'A cartoon shoe'],
        correctAnswerIndex: 0,
        encouragement: `Hooray! You correctly identified the ${subject}!`,
      },
      {
        id: 'plant-q3',
        question: 'Why are plants and trees so helpful for our Earth?',
        options: ['They give us clean, fresh air', 'They play video games', 'They fly like airplanes'],
        correctAnswerIndex: 0,
        encouragement: 'Super star! Plants give us fresh oxygen to breathe and shade on sunny days!',
      },
    ];
  }

  // Animals
  if (textCheck.includes('animal') || textCheck.includes('bird') || textCheck.includes('fish') || textCheck.includes('dog') || textCheck.includes('cat') || textCheck.includes('bear') || textCheck.includes('elephant')) {
    return [
      {
        id: 'animal-q1',
        question: `What kind of living creature is the ${subject}?`,
        options: ['An amazing animal', 'A stone brick', 'A television set'],
        correctAnswerIndex: 0,
        encouragement: `Spot on! The ${subject} is a wonderful animal living in our amazing world!`,
      },
      {
        id: 'animal-q2',
        question: 'What do animals need to stay healthy and energetic?',
        options: ['Wholesome food, clean water, and rest', 'Batteries and power cords', 'Coins and keys'],
        correctAnswerIndex: 0,
        encouragement: 'Great job! Animals need healthy food, fresh water, and cozy rest just like us!',
      },
      {
        id: 'animal-q3',
        question: 'How do animals explore their surroundings?',
        options: ['Using their senses like sight and smell', 'By reading newspapers', 'By riding elevators'],
        correctAnswerIndex: 0,
        encouragement: 'You are so smart! Animals use their keen eyesight, hearing, and scent to explore!',
      },
    ];
  }

  // Space
  if (textCheck.includes('space') || textCheck.includes('planet') || textCheck.includes('star') || textCheck.includes('moon') || textCheck.includes('astronaut')) {
    return [
      {
        id: 'space-q1',
        question: 'Where can we see stars, moons, and distant planets?',
        options: ['In outer space and the night sky', 'Inside a backpack', 'Underneath the kitchen table'],
        correctAnswerIndex: 0,
        encouragement: 'Blastoff! That is right! The vast cosmos is above us in the starry night sky!',
      },
      {
        id: 'space-q2',
        question: 'What special vehicle do astronauts use to travel into space?',
        options: ['A space rocket', 'A bicycle with bells', 'A wooden rowboat'],
        correctAnswerIndex: 0,
        encouragement: 'Fantastic! Powerful rockets launch brave astronauts past Earth’s atmosphere!',
      },
    ];
  }

  // General / Educational
  return [
    {
      id: 'general-q1',
      question: `What did we look at and learn about today?`,
      options: [`${subject}`, 'A flying alien dragon', 'A bucket of ice cream'],
      correctAnswerIndex: 0,
      encouragement: `Wonderful! You paid close attention to the ${subject}!`,
    },
    {
      id: 'general-q2',
      question: 'What do curious young learners do when seeing something new?',
      options: ['Look closely and ask questions', 'Close their eyes and run away', 'Ignore all the colors'],
      correctAnswerIndex: 0,
      encouragement: 'Bravo! Looking closely and being curious is the superpower of every great explorer!',
    },
    {
      id: 'general-q3',
      question: 'Why is it exciting to discover new shapes and colors?',
      options: ['It exercises our minds and makes us smart', 'It makes our hair turn purple', 'It melts our shoes'],
      correctAnswerIndex: 0,
      encouragement: 'Super duper! Exploring shapes and colors builds our brainpower every single day!',
    },
  ];
}

