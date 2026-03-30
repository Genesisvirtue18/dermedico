package com.skincare.ecommerce.Enum;

public enum ConcernGroup {

    SKIN("Skin related concerns like acne, pigmentation, ageing"),
    HAIR("Hair related concerns like dandruff, hair fall, bald patches"),
    SUPPLEMENT("Supplements for skin, hair and overall wellness");

    private final String description;

    ConcernGroup(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
