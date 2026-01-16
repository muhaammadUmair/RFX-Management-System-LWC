public class ResponseWrapper {
    public String SectionText;
	public String SectionIndex;
	public String OpportunityId;
	public String BidId;
	public List<Requirements> Requirements;

	public class Requirements {
        public String RequirementText;
		public String RequirementPlanText;
		public String RequirementIndex;
		public String ResponseText;
		public String ResponseIndex;
		public String IdText;
		public String IdIndex;
		public String LimitText;
		public String LimitIndex;
		public String ScoreText;
		public String ScoreIndex;
		public String StatusText;
		public String StatusIndex;
		public String fileID;
	}

	
	public static List<ResponseWrapper> parse(String json) {
		return (List<ResponseWrapper>) System.JSON.deserialize(json, List<ResponseWrapper>.class);
	}
}