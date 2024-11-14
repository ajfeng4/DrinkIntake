export type TabsParamList = {
    Home: undefined;
    FirstAndLastName: undefined;
};

export type RootStackParamList = {
    ExploreScreen: undefined;
    ReviewGoals: undefined;
    TrackWaterIntake: undefined;
    WaterIntakeStatistics: undefined;
    GoalScoreboard: undefined;
    SearchPage: undefined;
    '+not-found': undefined;
    SignUp: undefined;
    SignIn: undefined;
    VoiceRecorder: undefined;
    Attributes: undefined;
    TermsOfService: undefined;
    '(tabs)': {
        screen: keyof TabsParamList;
        params?: TabsParamList[keyof TabsParamList];
    };
};